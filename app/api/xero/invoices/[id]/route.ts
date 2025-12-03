import { NextRequest, NextResponse } from "next/server";
import { xeroClient } from "@/lib/xero/client";
import { ensureAuthenticated, getAuthenticatedTenantId } from "@/lib/xero/helpers";

/**
 * Xero Get Invoice Route
 * 
 * GET /api/xero/invoices/[id]
 * 
 * Retrieves invoice details from Xero
 * Supports PDF download with ?pdf=true query parameter
 */

interface GetInvoiceResponse {
  success: boolean;
  invoice?: {
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
    lineItems?: Array<{
      lineItemID?: string;
      description?: string;
      quantity?: number;
      unitAmount?: number;
      lineAmount?: number;
      accountCode?: string;
    }>;
  };
  pdfUrl?: string;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GetInvoiceResponse | Response>> {
  try {
    const invoiceId = params.id;

    if (!invoiceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invoice ID is required",
        },
        { status: 400 }
      );
    }

    // Check if PDF download is requested
    const searchParams = request.nextUrl.searchParams;
    const isPdfRequest = searchParams.get("pdf") === "true";

    // Ensure authentication and get tenant ID
    await ensureAuthenticated();
    const tenantId = await getAuthenticatedTenantId();

    console.log("[Xero Get Invoice] Fetching invoice", {
      invoiceId,
      isPdfRequest,
    });

    if (isPdfRequest) {
      // Return PDF
      try {
        console.log("[Xero Get Invoice] Fetching PDF", { invoiceId, tenantId });
        
        const pdfResponse = await xeroClient.accountingApi.getInvoiceAsPdf(
          tenantId,
          invoiceId
        );

        // The PDF is returned as a buffer/blob
        // xero-node returns the PDF in response.body
        const pdfBuffer = pdfResponse.body as unknown as Buffer | Uint8Array | Blob;

        if (!pdfBuffer) {
          throw new Error("PDF buffer is empty");
        }

        // Convert to proper format for NextResponse
        let responseBody: BodyInit;
        if (pdfBuffer instanceof Blob) {
          responseBody = pdfBuffer;
        } else if (Buffer.isBuffer(pdfBuffer)) {
          responseBody = pdfBuffer;
        } else {
          responseBody = new Uint8Array(pdfBuffer);
        }

        return new NextResponse(responseBody, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="invoice-${invoiceId}.pdf"`,
          },
        });
      } catch (pdfError: unknown) {
        console.error("[Xero Get Invoice] Error fetching PDF:", pdfError);
        const errorMessage =
          pdfError instanceof Error
            ? pdfError.message
            : "Failed to retrieve invoice PDF";

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
          },
          { status: 500 }
        );
      }
    }

    // Get invoice details
    const invoiceResponse = await xeroClient.accountingApi.getInvoice(
      tenantId,
      invoiceId
    );

    const invoice = invoiceResponse.body.invoices?.[0];

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: "Invoice not found",
        },
        { status: 404 }
      );
    }

    console.log("[Xero Get Invoice] Invoice retrieved successfully", {
      invoiceId: invoice.invoiceID,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
    });

    // Format response
    const response: GetInvoiceResponse = {
      success: true,
      invoice: {
        invoiceID: invoice.invoiceID || "",
        invoiceNumber: invoice.invoiceNumber,
        type: invoice.type?.toString(),
        status: invoice.status?.toString(),
        date: invoice.date ? (typeof invoice.date === 'string' ? invoice.date : (invoice.date instanceof Date ? invoice.date.toISOString() : String(invoice.date))) : undefined,
        dueDate: invoice.dueDate ? (typeof invoice.dueDate === 'string' ? invoice.dueDate : (invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : String(invoice.dueDate))) : undefined,
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
        lineItems: invoice.lineItems?.map((item) => ({
          lineItemID: item.lineItemID,
          description: item.description,
          quantity: item.quantity,
          unitAmount: item.unitAmount,
          lineAmount: item.lineAmount,
          accountCode: item.accountCode,
        })),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error("[Xero Get Invoice] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve invoice";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

