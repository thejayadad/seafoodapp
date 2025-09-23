'use client'
import { useState } from "react";
import DeliveryAddressModal from "./delivery-address-modal";
interface Option {
  value: string;
  label: string
}

interface SegmentedFulfillmentProps {
  options?: Option[];
}

export default function SegmentedFulfillment({
  options = [
    {value: "pickup", label: "Pickup"},
    {value: "delivery", label: "Delivery"}
  ]
}:SegmentedFulfillmentProps) {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [selected, setSelected] = useState<string>(options[0].value)

  const handleChange = (value: string) => {
    setSelected(value)
    if(value === "delivery")setShowDeliveryModal(true)
  }
  return (
   <>
    <div className="join border border-neutral-200 rounded-full overflow-hidden">
      {/*Delivery Options button */}
      {options.map((option,  idx) => {
        const isActive = selected === option.value
        return ( 
          
          <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          className={
            `
              flex=1 px-4 py-2 text-sm font-medium text-center 
              transition-colors duration-150
              ${isActive ? "bg-neutral-700 text-neutral-200": "bg-base-100 text-neutral-900"}
            `
          }
          >
            {option.label}
          </button>
        )
      })}

      {/* Delivery Modal */}
      {showDeliveryModal && (
       <DeliveryAddressModal onClose={() => setShowDeliveryModal(false)} />

      )}
    </div>
   </>
  );
}
