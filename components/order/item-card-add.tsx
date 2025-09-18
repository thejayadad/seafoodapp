// src/components/order/ItemCardAdd.tsx

import { addToCart } from "@/lib/actions/cart-actions";

export default function ItemCardAdd({
  id,
  name,
  description,
  priceCents,
  slug, // for future "View" page
}: {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  slug: string;
}) {
  return (
    <article className="card bg-base-100 border border-neutral-200 rounded-xl">
      <div className="card-body">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm opacity-70 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between pt-3">
          <span className="font-medium">${(priceCents / 100).toFixed(2)}</span>

          {/* SSR form -> adds to cookie cart */}
          <form action={addToCart} className="flex items-center gap-2">
            <input type="hidden" name="menuItemId" value={id} />
            <input
              name="qty"
              type="number"
              min={1}
              defaultValue={1}
              className="input input-bordered input-xs w-14 text-center"
              aria-label="Quantity"
            />
            <button className="btn btn-sm" type="submit">
              Add
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
