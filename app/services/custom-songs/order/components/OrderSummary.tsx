"use client";

import { CheckCircle } from "lucide-react";

interface PackageDetails {
  value: string;
  name: string;
  price: number;
  format: string;
  revisions: string;
  deliveryTime: string;
}

interface OrderSummaryProps {
  selectedPackage: PackageDetails | null;
  discountApplied: boolean;
  discountAmount: number;
  finalPrice: number;
  appliedPromoCode: string;
}

const packageDetails: Record<string, Omit<PackageDetails, "value">> = {
  standard: {
    name: "Standard Occasion",
    price: 29,
    format: "MP3 + Lyric Sheet",
    revisions: "2 revision rounds",
    deliveryTime: "3-5 days",
  },
  express: {
    name: "Express Personal",
    price: 49,
    format: "MP3 format",
    revisions: "1 revision round",
    deliveryTime: "24-48 hours",
  },
  wedding: {
    name: "Wedding Trio",
    price: 149,
    format: "MP3 + WAV formats",
    revisions: "3 revision rounds",
    deliveryTime: "5-7 days",
  },
};

export function OrderSummary({
  selectedPackage,
  discountApplied,
  discountAmount,
  finalPrice,
  appliedPromoCode,
}: OrderSummaryProps) {
  if (!selectedPackage) {
    return (
      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Order Summary</h3>
        <p className="text-sm text-slate-500 break-words">Select a package to see pricing details</p>
      </div>
    );
  }

  const packageInfo = packageDetails[selectedPackage.value];
  if (!packageInfo) return null;

  const basePrice = packageInfo.price;

  return (
    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Order Summary</h3>

      {/* Package Details */}
      <div className="mb-4 sm:mb-6">
        <div className="mb-3">
          <h4 className="font-medium text-slate-900 mb-2 text-sm sm:text-base break-words">{packageInfo.name}</h4>
          <div className="space-y-1.5 text-xs sm:text-sm text-slate-600">
            <div className="break-words">Format: {packageInfo.format}</div>
            <div className="break-words">Revisions: {packageInfo.revisions}</div>
            <div className="break-words">Delivery: {packageInfo.deliveryTime}</div>
          </div>
        </div>

        {/* Package Inclusions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-slate-700 mb-2">Package Includes:</p>
          <ul className="space-y-1.5">
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
              <span>Custom song composition</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
              <span>{packageInfo.format}</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
              <span>{packageInfo.revisions}</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
              <span>Delivery within {packageInfo.deliveryTime}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center gap-2">
          <span className="text-slate-600 text-xs sm:text-sm break-words">Package Price</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {discountApplied && (
              <span className="text-xs sm:text-sm text-slate-400 line-through">
                ${basePrice.toFixed(2)}
              </span>
            )}
            <span className={`font-semibold text-sm sm:text-base text-slate-900 ${discountApplied ? "text-teal-600" : ""}`}>
              ${discountApplied ? finalPrice.toFixed(2) : basePrice.toFixed(2)}
            </span>
          </div>
        </div>

        {discountApplied && (
          <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200 gap-2">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium flex-wrap">
                <span className="break-words">Discount (20% off)</span>
                <span className="text-xs bg-green-100 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                  {appliedPromoCode}
                </span>
              </span>
              <span className="text-xs text-green-700 mt-0.5 break-words">
                Save ${discountAmount.toFixed(2)}
              </span>
            </div>
            <span className="font-semibold text-sm sm:text-base flex-shrink-0">-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-300 gap-2">
          <span className="font-semibold text-sm sm:text-base text-slate-900 break-words">Total</span>
          <div className="text-right flex-shrink-0">
            <span className="text-lg sm:text-xl font-bold text-teal-600">
              ${finalPrice.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 ml-1">AUD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

