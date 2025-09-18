// src/components/filters/order-summary.tsx
import { readCart, totals } from "@/lib/cart";
import SeaNotice from "@/components/ui/sea-notice"; // <-- add this import
import { clearCartAction, removeLine, setQty } from "@/lib/actions/cart-actions";

export default async function OrderSummaryCard() {
  const cart = await readCart();              // ⬅️ await now
  const { subtotalCents } = totals(cart);

  return (
    <aside className="card bg-base-100 border border-neutral-200 w-full">
      <details open className="card-body gap-0">
        <summary className="flex items-center justify-between py-2 cursor-pointer list-none">
          <h3 className="font-semibold">Order Summary</h3>
          <span className="text-sm opacity-70">^</span>
        </summary>

        <div className="divider my-0" />

        <div className="space-y-4 py-4">
          {cart.lines.length === 0 ? (
            // ⬇️ replace your previous empty state with this
            <SeaNotice
              message="Your net is empty — add something tasty to your order."
              icon="fish"
              tone="neutral"
            />
          ) : (
            cart.lines.map((l) => (
              <div key={l.id} className="grid grid-cols-[1fr,auto] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{l.name}</span>
                  </div>
                  <div className="text-xs opacity-70">Medium</div>

                  <div className="flex items-center gap-3 text-xs mt-1">
                    <form action={setQty} className="inline-flex gap-1 items-center">
                      <input type="hidden" name="lineId" value={l.id} />
                      <span className="opacity-60">Qty</span>
                      <input
                        type="number"
                        name="qty"
                        min={1}
                        defaultValue={l.qty}
                        className="input input-bordered input-xs w-14 text-center border-neutral-200"
                      />
                      <button className="link link-hover text-xs" type="submit">
                        Update
                      </button>
                    </form>

                    <form action={removeLine}>
                      <input type="hidden" name="lineId" value={l.id} />
                      <button type="submit" className="link link-hover text-xs">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>

                <div className="text-right font-medium">
                  ${((l.unitPriceCents * l.qty) / 100).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="divider my-2" />

        <div className="flex items-center justify-between py-2">
          <span className="font-semibold">Subtotal</span>
          <span className="font-semibold">${(subtotalCents / 100).toFixed(2)}</span>
        </div>

        <div className="mt-3 space-y-2">
          <button className="btn btn-block rounded-2xl btn-neutral" type="button" disabled={cart.lines.length === 0}>
            Checkout
          </button>

          {cart.lines.length > 0 && (
            <form action={clearCartAction}>
              <button type="submit" className="btn btn-ghost rounded-2xl btn-block border border-neutral-200">
                Clear
              </button>
            </form>
          )}
        </div>
      </details>
    </aside>
  );
}
