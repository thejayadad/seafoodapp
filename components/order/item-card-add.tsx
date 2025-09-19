// src/components/order/item-card.tsx

import ItemOptionsModal, { AddOnOpt, SizeOpt } from "./order-items-modal";

type Props = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  sizes?: SizeOpt[];   // optional
  addons?: AddOnOpt[]; // optional
};

/** Reasonable defaults if none are passed in */
const DEFAULT_SIZES: SizeOpt[] = [
  { id: "size-s", label: "Small" },
  { id: "size-m", label: "Medium", deltaCents: 100 },
  { id: "size-l", label: "Large", deltaCents: 300 },
];

const DEFAULT_ADDONS: AddOnOpt[] = [
  { id: "ao-green-onion", label: "Extra Green Onions", deltaCents: 50 },
  { id: "ao-veggies", label: "Extra Vegetables", deltaCents: 100 },
  { id: "ao-extra-meat", label: "Extra Meat", deltaCents: 200 },
];

export default function ItemCard({
  id,
  slug,
  name,
  description,
  priceCents,
  sizes = DEFAULT_SIZES,
  addons = DEFAULT_ADDONS,
}: Props) {
  const modalId = `modal-${slug}`;

  return (
    <>
      {/* Card opens modal via label/for (no client JS) */}
      <label
        htmlFor={modalId}
        className="card bg-base-100 border border-neutral-200 rounded-2xl cursor-pointer hover:shadow-sm transition"
      >
        <div className="card-body">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm opacity-70 line-clamp-2">{description}</p>
          <div className="pt-2 font-medium">
            ${(priceCents / 100).toFixed(2)}
          </div>
        </div>
      </label>

      {/* Modal with size/add-on config and 'Add to order' */}
      <ItemOptionsModal
        modalId={modalId}
        itemId={id}
        itemName={name}
        itemDescription={description}
        basePriceCents={priceCents}
        sizes={sizes}
        addons={addons}
      />
    </>
  );
}
