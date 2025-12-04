import { NextRequest, NextResponse } from "next/server";
import { xeroClient } from "@/lib/xero/client";
import { ensureAuthenticated, getAuthenticatedTenantId } from "@/lib/xero/helpers";
import { getLogger } from "@/lib/logging";

const xeroInvoicesLogger = getLogger("xero.invoices.list");

/**
 * Xero List Invoices Route
 * 
 * GET /api/xero/invoices
 * 
 * Retrieves a list of invoices from Xero
 * Supports query parameters: where, order, page
 */

interface ListInvoicesResponse {
  success: boolean;
  invoices?: Array<{
    invoiceID: string;
    invoiceNumber?: string;
    type?: string;
    status?: string;
    date?: string;
    dueDate?: string;
    reference?: string;
    total?: number;
    totalTax?: number;
    amountDue?: number;
    amountPaid?: number;
    contact?: {
      contactID?: string;
      name?: string;
      emailAddress?: string;
    };
  }>;
  error?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ListInvoicesResponse>> {
  try {
    // Ensure authentication and get tenant ID
    await ensureAuthenticated();
    const tenantId = await getAuthenticatedTenantId();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const where = searchParams.get("where") || undefined;
    const order = searchParams.get("order") || undefined;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : undefined;

    xeroInvoicesLogger.info("Fetching invoices from Xero", {
      tenantId,
      where,
      order,
      page,
    });

    // Get invoices from Xero
    const invoicesResponse = await xeroClient.accountingApi.getInvoices(
      tenantId,
      undefined, // ifModifiedSince
      where,
      order,
      undefined, // IDs
      undefined, // contactIDs
      undefined, // statuses
      undefined, // page - Xero API page parameter format differs
      undefined // includeArchived
    );

    const xeroInvoices = invoicesResponse.body.invoices || [];

    // Format response
    const invoices = xeroInvoices.map((invoice) => {
      const formatDate = (date: string | Date | undefined): string | undefined => {
        if (!date) return undefined;
        if (typeof date === 'string') return date;
        if (date instanceof Date) return date.toISOString();
        return String(date);
      };

      return {
        invoiceID: invoice.invoiceID || "",
        invoiceNumber: invoice.invoiceNumber,
        type: invoice.type?.toString(),
        status: invoice.status?.toString(),
        date: formatDate(invoice.date),
        dueDate: formatDate(invoice.dueDate),
      reference: invoice.reference,
      total: invoice.total,
      totalTax: invoice.totalTax,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      contact: invoice.contact
        ? {
            contactID: invoice.contact.contactID,
            name: invoice.contact.name,
            emailAddress: invoice.contact.emailAddress,
          }
        : undefined,
      };
    });

    xeroInvoicesLogger.info("Invoices retrieved from Xero", {
      count: invoices.length,
    });

    return NextResponse.json(
      {
        success: true,
        invoices,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    xeroInvoicesLogger.error("Error listing Xero invoices", undefined, error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve invoices";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

