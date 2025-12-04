import { NextRequest, NextResponse } from "next/server";
import { getLogger } from "@/lib/logging";
import {
  AppError,
  TimeoutError,
} from "@/lib/errors";
import * as Sentry from "@sentry/nextjs";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  requestId: string;
  retryable?: boolean;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  requestId: string;
  retryable?: boolean;
}

export type ApiResponse<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

type ApiHandler<T = unknown> = (
  request: NextRequest
) => Promise<NextResponse<T>> | NextResponse<T>;

function generateRequestId(request: NextRequest): string {
  const headerId = request.headers.get("x-request-id");
  if (headerId) return headerId;
  return `req_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function withApiHandler<T = unknown>(
  handler: (request: NextRequest, requestId: string) => Promise<T> | T
): ApiHandler<ApiResponse<T>> {
  const apiLogger = getLogger("api");

  return async function wrapped(
    request: NextRequest
  ): Promise<NextResponse<ApiResponse<T>>> {
    const requestId = generateRequestId(request);

    try {
      const data = await handler(request, requestId);

      const body: ApiSuccessResponse<T> = {
        success: true,
        data,
        requestId,
      };

      return NextResponse.json(body, { status: 200 });
    } catch (err: unknown) {
      let statusCode = 500;
      let code = "INTERNAL_ERROR";
      let message = "An unexpected error occurred. Please try again later.";
      let details: unknown;
      let retryable: boolean | undefined;

      if (err instanceof AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;
        details = err.details;
        retryable = err.retryable;
      } else if (err instanceof TimeoutError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;
        details = err.details;
        retryable = err.retryable;
      } else if (err instanceof Error) {
        details = { name: err.name };
      }

      apiLogger.error("API handler error", {
        requestId,
        code,
        statusCode,
      }, err);

      // Capture error to Sentry (only for unexpected errors, not AppError)
      if (!(err instanceof AppError) && err instanceof Error) {
        Sentry.captureException(err, {
          tags: {
            requestId,
            errorCode: code,
            statusCode: statusCode.toString(),
          },
          extra: {
            requestId,
            code,
            statusCode,
            url: request.url,
            method: request.method,
          },
        });
      }

      const body: ApiErrorResponse = {
        success: false,
        error: {
          code,
          message,
          // Intentionally omitting stack traces; details can contain safe metadata only
          ...(details ? { details } : {}),
        },
        requestId,
        ...(retryable !== undefined ? { retryable } : {}),
      };

      return NextResponse.json(body, { status: statusCode });
    }
  };
}


