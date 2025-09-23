// src/components/filters/order-summary.tsx
import { readCart, totals } from "@/lib/cart";
import SeaNotice from "@/components/ui/sea-notice";
import RemoveButton from "../order/remove-button";
import {
  clearCartAction,
  removeLine,
  setQty,
  removeAddonFromLine,
} from "@/lib/actions/cart-actions";
import Link from "next/link";

export default async function OrderSummaryCard() {
  const cart = await readCart();
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
            <SeaNotice
              message="Your net is empty — add something tasty to your order."
              icon="fish"
              tone="neutral"
            />
          ) : (
            cart.lines.map((l: any) => (
              <div key={l.id} className="grid grid-cols-[1fr,auto] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{l.name}</span>
                  </div>

                  {/* Selected add-ons (each removable) */}
                  {Array.isArray(l.meta?.addonIds) && l.meta.addonIds.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {l.meta.addonIds.map((aid: string) => {
                        const label = l.meta?.addonLabels?.[aid] ?? "Add-on";
                        const priceCents = l.meta?.addonPrices?.[aid] ?? 0;
                        return (
                          <li key={aid} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 opacity-80">
                              <span>{label}</span>
                              <span className="opacity-60">
                                +${(priceCents / 100).toFixed(2)}
                              </span>
                            </div>
                            {/* <form action={removeAddonFromLine}>
                              <input type="hidden" name="lineId" value={l.id} />
                              <input type="hidden" name="addonId" value={aid} />
                              <button className="link link-hover" type="submit">
                                Remove
                              </button>
                            </form> */}
                            <RemoveButton
                            hiddenFields={{lineId: l.id, addonId: aid}}
                            action={removeAddonFromLine}
                            label="Remove"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Special instructions (only if non-empty) */}
                  {typeof l.meta?.notes === "string" &&
                    l.meta.notes.trim().length > 0 && (
                      <div className="text-xs opacity-60 mt-1">
                        “{l.meta.notes}”
                      </div>
                    )}

                  {/* Qty + remove line */}
                  <div className="flex items-center gap-3 text-xs mt-2">
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

                    {/* <form action={removeLine}>
                      <input type="hidden" name="lineId" value={l.id} />
                      <button type="submit" className="link link-hover text-xs">
                        Remove item
                      </button>
                    </form> */}
                    <RemoveButton
                      label="Remove Item"
                      hiddenFields={{lineId: l.id}}
                      action={removeLine}
                    />
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
          <span className="font-semibold">
            ${(subtotalCents / 100).toFixed(2)}
          </span>
        </div>

        <div className="mt-3 space-y-2">

{cart.lines.length === 0 ? (
  <button className="btn btn-neutral btn-block rounded-2xl" disabled>
    Checkout
  </button>
) : (
  <Link href="/cart" className="btn btn-neutral btn-block rounded-2xl">
    Checkout
  </Link>
)}


          {cart.lines.length > 0 && (
            <form action={clearCartAction}>
              <button
                type="submit"
                className="btn btn-ghost rounded-2xl btn-block border border-neutral-200"
              >
                Clear
              </button>
            </form>
          )}
        </div>
      </details>
    </aside>
  );
}
