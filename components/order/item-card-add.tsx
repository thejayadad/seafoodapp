// src/components/order/item-card.tsx  (new)

import ItemOptionsModal, { AddOnOpt, SizeOpt } from "./order-items-modal";

export default function ItemCard({
  id, slug, name, description, priceCents,
  sizes, addons,
}: {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  sizes: SizeOpt[];
  addons?: AddOnOpt[];
}) {
  const modalId = `modal-${slug}`;
  return (
    <>
      {/* Card becomes the opener via <label htmlFor> (DaisyUI modal) */}
      <label htmlFor={modalId} className="card bg-base-100 border border-neutral-200 rounded-2xl cursor-pointer hover:shadow-sm transition">
        <div className="card-body">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm opacity-70 line-clamp-2">{description}</p>
          <div className="pt-2 font-medium">${(priceCents / 100).toFixed(2)}</div>
        </div>
      </label>

      {/* The modal itself */}
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
