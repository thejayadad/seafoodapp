// src/app/success/page.tsx
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/money";
import Link from "next/link";
import { confirmOrderFromStripeSession } from "@/lib/actions/order-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order Confirmed — Dockside Bites" };

// ---- Server Actions (must be defined in the same module/file) ----
async function finalizeToHome(formData: FormData) {
  "use server";
  const { clearCart } = await import("@/lib/cart"); // dynamic import is fine
  const sessionId = String(formData.get("sessionId") || "");
  await confirmOrderFromStripeSession(sessionId); // idempotent update to PAID
  await clearCart();                              // cookies.set in a Server Action ✅
  // redirect home
  const { redirect } = await import("next/navigation");
  redirect("/");
}

async function finalizeToOrders(formData: FormData) {
  "use server";
  const { clearCart } = await import("@/lib/cart");
  const sessionId = String(formData.get("sessionId") || "");
  await confirmOrderFromStripeSession(sessionId);
  await clearCart();
  const { redirect } = await import("next/navigation");
  redirect("/orders");
}

// ------------------------------------------------------------------

type PageProps = { searchParams?: { session_id?: string } };

export default async function SuccessPage({ searchParams }: PageProps) {
  const sessionId = searchParams?.session_id ?? "";
  if (!sessionId) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="alert alert-warning rounded-2xl border border-neutral-200">
          <span>Missing checkout session. If you paid, check your email confirmation.</span>
        </div>
        <div className="mt-6">
          <Link href="/" className="btn">Back home</Link>
        </div>
      </div>
    );
  }

  // Confirm on the server (no cookies here)
  const result = await confirmOrderFromStripeSession(sessionId);

  // Pull order + items for receipt (show what we can)
  const order = await prisma.order.findFirst({
    where: { stripeSessionId: sessionId },
    include: { items: { include: { menuItem: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="card bg-base-100 border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200">
          <h1 className="text-2xl font-semibold">
            {result.ok ? "Thank you!" : "Thanks — almost there!"}
          </h1>
          <p className="opacity-70">
            {result.ok
              ? "Your order has been received."
              : "We’re still confirming your payment. This can take a moment."}
          </p>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-70">Order</div>
              <div className="font-medium">{order ? `#${order.id.slice(0, 8)}` : "—"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-70">Status</div>
              <div className="font-medium">{order?.status ?? "—"}</div>
            </div>
          </div>

          <div className="divider my-2" />

          {order?.items?.length ? (
            <div className="space-y-3">
              {order.items.map((it) => (
                <div key={it.id} className="grid grid-cols-[1fr,auto] gap-2">
                  <div>
                    <div className="font-medium">{it.menuItem?.name ?? "Item"}</div>
                    <div className="text-xs opacity-70">Qty {it.qty}</div>
                  </div>
                  <div className="text-right font-medium">
                    {formatUSD(it.unitPriceCents * it.qty)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm opacity-70">No line items available.</div>
          )}

          <div className="divider my-2" />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Subtotal</span>
            <span className="font-semibold">
              {order ? formatUSD(order.subtotalCents) : "—"}
            </span>
          </div>

          {/* Finalize buttons (Server Actions) */}
          <div className="mt-6 flex items-center justify-between">
            <form action={finalizeToHome}>
              <input type="hidden" name="sessionId" value={sessionId} />
              <button className="btn btn-ghost rounded-2xl border border-neutral-200" type="submit">
                Continue browsing
              </button>
            </form>

            <form action={finalizeToOrders}>
              <input type="hidden" name="sessionId" value={sessionId} />
              <button className="btn btn-neutral rounded-2xl" type="submit">
                View my orders
              </button>
            </form>
          </div>
        </div>
      </div>

      <p className="text-xs opacity-60 mt-4">
        A receipt has been sent to your email. Questions? Reply to that email.
      </p>
    </div>
  );
}
