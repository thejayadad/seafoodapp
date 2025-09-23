'use client'
import { useMemo } from "react";

type AddToOrderButtonProps = {
  formId?: string;
  modalId: string;
  label?: string;
  basePriceCents: number;
  addonIds?: string[];
  addonPrices?: Record<string, number>;
};

export default function AddToOrderButton({ formId, modalId, label = "Add to Order", basePriceCents, addonIds = [], addonPrices = {} }: AddToOrderButtonProps) {
  const addonsTotal = useMemo(() => addonIds.reduce((sum, id) => sum + (addonPrices[id] ?? 0), 0), [addonIds, addonPrices]);
  const totalPrice = basePriceCents + addonsTotal;

  const handleClick = () => {
    const checkbox = document.getElementById(modalId) as HTMLInputElement;
    if (checkbox) checkbox.checked = false; // close modal
  };

  return (
    <button type="submit" form={formId} onClick={handleClick} className="btn btn-neutral h-11 min-h-0 rounded-full px-6 min-w-[12rem] justify-between">
      <span>{label}</span>
      <span className="opacity-90">{`$${(totalPrice / 100).toFixed(2)}`}</span>
    </button>
  );
}
