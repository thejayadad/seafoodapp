import { auth } from "@/auth";
import { readCart } from "@/lib/cart";
import { formatUSD } from "@/lib/money";
import { setQty, removeLine, clearCartAction } from "@/lib/actions/cart-actions";
import SeaNotice from "@/components/ui/sea-notice";
import Link from "next/link";
import { computeTotals } from "@/lib/total";
import { createCheckoutSession } from "@/lib/actions/checkout-action";

export const metadata = { title: "Your Cart — Dockside Bites" };

export default async function CartPage() {
  const session = await auth();
  const cart = await readCart();
  const { subtotalCents, taxCents, feesCents, totalCents, taxRate } = computeTotals(cart);

  const signedIn = Boolean(session?.user?.email);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Your Order</h1>
        <p className="opacity-70 text-sm">Review your items and proceed to secure checkout.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6">
        {/* Left: items */}
        <section className="space-y-4">
          {cart.lines.length === 0 ? (
            <SeaNotice
              message="Your net is empty — add something tasty to your order."
              icon="fish"
              tone="neutral"
            />
          ) : (
            cart.lines.map((l: any) => (
              <article key={l.id} className="card bg-base-100 border border-neutral-200 rounded-2xl">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{l.name}</h3>

                      {/* Add-ons */}
                      {Array.isArray(l.meta?.addonIds) && l.meta.addonIds.length > 0 && (
                        <ul className="mt-1 space-y-1">
                          {l.meta.addonIds.map((aid: string) => {
                            const label = l.meta?.addonLabels?.[aid] ?? "Add-on";
                            const priceCents = l.meta?.addonPrices?.[aid] ?? 0;
                            return (
                              <li key={aid} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 opacity-80">
                                  <span>{label}</span>
                                  <span className="opacity-60">+{formatUSD(priceCents)}</span>
                                </div>
                                {/* Remove add-on uses the same action as summary; optional to include here */}
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* Notes */}
                      {typeof l.meta?.notes === "string" && l.meta.notes.trim().length > 0 && (
                        <div className="text-xs opacity-60 mt-1">“{l.meta.notes}”</div>
                      )}

                      {/* Qty + remove */}
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

                        <form action={removeLine}>
                          <input type="hidden" name="lineId" value={l.id} />
                          <button type="submit" className="link link-hover text-xs">
                            Remove
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="text-right font-medium">
                      {formatUSD(l.unitPriceCents * l.qty)}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}

          {/* Keep browsing link */}
          <div className="mt-2">
            <Link href="/" className="link">← Continue shopping</Link>
          </div>
        </section>

        {/* Right: totals + checkout */}
        <aside className="lg:sticky lg:top-6 self-start">
          <div className="card bg-base-100 border border-neutral-200 rounded-2xl">
            <div className="card-body">
              <h2 className="font-semibold">Order Summary</h2>

              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatUSD(subtotalCents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
                  <span>{formatUSD(taxCents)}</span>
                </div>
                {feesCents > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Fees</span>
                    <span>{formatUSD(feesCents)}</span>
                  </div>
                )}
                <div className="divider my-2" />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatUSD(totalCents)}</span>
                </div>
              </div>

              {/* CTA: if not signed in → prompt; else → stripe */}
              {cart.lines.length === 0 ? (
                <button className="btn btn-neutral btn-block rounded-2xl" disabled>
                  Checkout
                </button>
              ) : signedIn ? (
                <form action={createCheckoutSession} className="mt-3">
                  <button className="btn btn-neutral btn-block rounded-2xl">
                    Proceed to payment
                  </button>
                </form>
              ) : (
                <SeaNotice
                  message="Please sign in to proceed to payment."
                  icon="waves"
                  tone="info"
                />
              )}

              {cart.lines.length > 0 && (
                <form action={clearCartAction} className="mt-2">
                  <button
                    type="submit"
                    className="btn btn-ghost btn-block rounded-2xl border border-neutral-200"
                  >
                    Clear cart
                  </button>
                </form>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
