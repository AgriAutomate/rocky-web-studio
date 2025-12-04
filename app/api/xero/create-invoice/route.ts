import { NextRequest, NextResponse } from "next/server";
import { xeroClient } from "@/lib/xero/client";
import { ensureAuthenticated, getAuthenticatedTenantId } from "@/lib/xero/helpers";
import { Invoice, Contact, LineItem } from "xero-node";
import { getLogger } from "@/lib/logging";

const xeroCreateInvoiceLogger = getLogger("xero.invoices.create");

/**
 * Xero Create Invoice Route
 * 
 * POST /api/xero/create-invoice
 * 
 * Creates an invoice in Xero with the following steps:
 * 1. Authenticates and refreshes tokens if needed
 * 2. Checks if contact exists, creates if not
 * 3. Creates invoice with line items
 * 4. Returns invoice ID and number
 */

interface CreateInvoiceRequest {
  contactName: string;
  contactEmail: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    accountCode?: string; // Default: "200" (Sales)
  }>;
  dueDate: string; // ISO date string
  reference?: string;
  status?: "DRAFT" | "SUBMITTED"; // Default: "DRAFT"
}

interface CreateInvoiceResponse {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  contactId?: string;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateInvoiceResponse>> {
  try {
    // Parse request body
    const body = (await request.json()) as CreateInvoiceRequest;

    // Validate required fields
    if (!body.contactName || !body.contactEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "contactName and contactEmail are required",
        },
        { status: 400 }
      );
    }

    if (!body.lineItems || body.lineItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one line item is required",
        },
        { status: 400 }
      );
    }

    if (!body.dueDate) {
      return NextResponse.json(
        {
          success: false,
          error: "dueDate is required",
        },
        { status: 400 }
      );
    }

    // Ensure authentication and get tenant ID
    await ensureAuthenticated();
    const tenantId = await getAuthenticatedTenantId();

    xeroCreateInvoiceLogger.info("Starting invoice creation", {
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      lineItemsCount: body.lineItems.length,
    });

    // Check if contact exists
    let contactId: string | undefined;

    try {
      // Search for contact by email
      // Xero API supports where parameter for filtering
      const whereClause = `EmailAddress="${body.contactEmail}"`;
      const contactsResponse = await xeroClient.accountingApi.getContacts(
        tenantId,
        undefined,
        whereClause
      );

      const contacts = contactsResponse.body.contacts;
      
      // Also check by name if email search doesn't find anything
      let foundContact = contacts?.find(
        (c) => c.emailAddress?.toLowerCase() === body.contactEmail.toLowerCase()
      );

      if (!foundContact && contacts && contacts.length > 0) {
        // Use first result if email matches aren't found but query returned results
        foundContact = contacts[0];
      }

        if (foundContact && foundContact.contactID) {
          // Contact exists, use it
          contactId = foundContact.contactID;
          xeroCreateInvoiceLogger.info("Xero contact found", {
            contactId,
            name: foundContact.name,
          });
      } else {
        // Contact doesn't exist, create it
        xeroCreateInvoiceLogger.info("Xero contact not found, creating new contact", {
          contactEmail: body.contactEmail,
        });

        const newContact: Contact = {
          name: body.contactName,
          emailAddress: body.contactEmail,
        };

        const createContactsResponse = await xeroClient.accountingApi.createContacts(
          tenantId,
          {
            contacts: [newContact],
          }
        );

        const createdContacts = createContactsResponse.body.contacts;
        if (createdContacts && createdContacts.length > 0 && createdContacts[0]?.contactID) {
          contactId = createdContacts[0].contactID;
          xeroCreateInvoiceLogger.info("Xero contact created", { contactId });
        } else {
          throw new Error("Failed to create contact in Xero");
        }
      }
    } catch (contactError: unknown) {
      xeroCreateInvoiceLogger.error("Error managing Xero contact", undefined, contactError);
      const errorMessage =
        contactError instanceof Error
          ? contactError.message
          : "Failed to find or create contact";
      throw new Error(`Contact error: ${errorMessage}`);
    }

    if (!contactId) {
      throw new Error("Failed to obtain contact ID");
    }

    // Build line items
    const invoiceLineItems: LineItem[] = body.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      accountCode: item.accountCode || "200", // Default to Sales account
      lineAmount: item.quantity * item.unitAmount,
    }));

    // Create invoice
    const invoiceStatus =
      body.status === "SUBMITTED"
        ? Invoice.StatusEnum.SUBMITTED
        : Invoice.StatusEnum.DRAFT;

    const invoice: Invoice = {
      type: Invoice.TypeEnum.ACCREC, // Accounts Receivable
      contact: {
        contactID: contactId,
      },
      lineItems: invoiceLineItems,
      dueDate: body.dueDate, // Xero expects ISO date string
      reference: body.reference || undefined,
      status: invoiceStatus,
    };

    xeroCreateInvoiceLogger.info("Creating Xero invoice", {
      contactId,
      status: invoiceStatus,
      lineItemsCount: invoiceLineItems.length,
    });

    const invoicesResponse = await xeroClient.accountingApi.createInvoices(
      tenantId,
      {
        invoices: [invoice],
      }
    );

    const createdInvoices = invoicesResponse.body.invoices;
    if (!createdInvoices || createdInvoices.length === 0 || !createdInvoices[0]) {
      throw new Error("Failed to create invoice in Xero");
    }

    const createdInvoice = createdInvoices[0];

    if (!createdInvoice.invoiceID) {
      throw new Error("Invoice created but no ID returned");
    }

    xeroCreateInvoiceLogger.info("Xero invoice created successfully", {
      invoiceId: createdInvoice.invoiceID,
      invoiceNumber: createdInvoice.invoiceNumber,
    });

    return NextResponse.json(
      {
        success: true,
        invoiceId: createdInvoice.invoiceID,
        invoiceNumber: createdInvoice.invoiceNumber || undefined,
        contactId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    xeroCreateInvoiceLogger.error("Error creating Xero invoice", undefined, error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to create invoice";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

