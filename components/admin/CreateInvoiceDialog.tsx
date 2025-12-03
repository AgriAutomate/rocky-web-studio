"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitAmount: z.number().min(0.01, "Amount must be greater than 0"),
  accountCode: z.string().optional(),
});

const invoiceSchema = z.object({
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required"),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  dueDate: z.string().min(1, "Due date is required"),
  reference: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
}: CreateInvoiceDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      contactName: "",
      contactEmail: "",
      lineItems: [
        {
          description: "",
          quantity: 1,
          unitAmount: 0,
          accountCode: "200",
        },
      ],
      dueDate: new Date().toISOString().split("T")[0],
      reference: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const onSubmit = async (data: InvoiceFormValues) => {
    setSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/xero/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          status: "DRAFT", // Default to draft, can be changed later
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create invoice");
      }

      setSubmitStatus("success");
      setTimeout(() => {
        reset();
        setSubmitStatus("idle");
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create invoice"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAndSubmit = async (data: InvoiceFormValues) => {
    setSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/xero/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          status: "SUBMITTED",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create invoice");
      }

      setSubmitStatus("success");
      setTimeout(() => {
        reset();
        setSubmitStatus("idle");
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create invoice"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice in Xero. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  {...register("contactName")}
                  placeholder="John Doe"
                />
                {errors.contactName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.contactName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register("contactEmail")}
                  placeholder="john@example.com"
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Line Items *</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    description: "",
                    quantity: 1,
                    unitAmount: 0,
                    accountCode: "200",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-4 p-4 border rounded-lg"
                >
                  <div className="col-span-12 md:col-span-5">
                    <Label htmlFor={`lineItems.${index}.description`}>
                      Description
                    </Label>
                    <Input
                      {...register(`lineItems.${index}.description`)}
                      placeholder="Service description"
                    />
                    {errors.lineItems?.[index]?.description && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.lineItems[index]?.description?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Label htmlFor={`lineItems.${index}.quantity`}>
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lineItems.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      placeholder="1"
                    />
                    {errors.lineItems?.[index]?.quantity && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.lineItems[index]?.quantity?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Label htmlFor={`lineItems.${index}.unitAmount`}>
                      Unit Amount
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lineItems.${index}.unitAmount`, {
                        valueAsNumber: true,
                      })}
                      placeholder="0.00"
                    />
                    {errors.lineItems?.[index]?.unitAmount && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.lineItems[index]?.unitAmount?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Label htmlFor={`lineItems.${index}.accountCode`}>
                      Account
                    </Label>
                    <Input
                      {...register(`lineItems.${index}.accountCode`)}
                      placeholder="200"
                    />
                  </div>
                  <div className="col-span-1 flex items-end">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.lineItems && (
              <p className="text-sm text-red-600">
                {errors.lineItems.message || "At least one line item is required"}
              </p>
            )}
          </div>

          {/* Invoice Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register("dueDate")}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  {...register("reference")}
                  placeholder="INV-001"
                />
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === "success" && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800">
                Invoice created successfully!
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">
                {errorMessage || "Failed to create invoice"}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSubmit(handleCreateAndSubmit)}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & Submit"
              )}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create as Draft"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

