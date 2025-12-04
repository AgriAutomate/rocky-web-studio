export interface AppErrorOptions {
  statusCode?: number;
  code?: string;
  details?: unknown;
  retryable?: boolean;
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;
  retryable: boolean;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? this.constructor.name;
    this.details = options.details;
    this.retryable = options.retryable ?? false;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details,
      retryable: false,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, {
      statusCode: 401,
      code: "AUTHENTICATION_ERROR",
      retryable: false,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Not authorized") {
    super(message, {
      statusCode: 403,
      code: "AUTHORIZATION_ERROR",
      retryable: false,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, {
      statusCode: 404,
      code: "NOT_FOUND",
      retryable: false,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message = "External service error",
    details?: unknown,
    retryable = true
  ) {
    super(message, {
      statusCode: 502,
      code: "EXTERNAL_SERVICE_ERROR",
      details,
      retryable,
    });
  }
}

export class TimeoutError extends AppError {
  constructor(message = "Request timed out", details?: unknown) {
    super(message, {
      statusCode: 504,
      code: "TIMEOUT",
      details,
      retryable: true,
    });
  }
}


