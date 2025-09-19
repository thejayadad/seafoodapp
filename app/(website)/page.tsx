// src/app/orders/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/money";
import Link from "next/link";
import { cancelMyPendingOrder } from "@/lib/actions/order-actoin";

export const metadata = { title: "My Orders — Dockside Bites" };

function StatusBadge({ status }: { status: "PENDING" | "PAID" | "CANCELED" }) {
  const tone =
    status === "PAID" ? "badge-success"
    : status === "PENDING" ? "badge-warning"
    : "badge-ghost";
  return <span className={`badge ${tone}`}>{status}</span>;
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function OrdersPage() {
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!email) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="card bg-base-100 border border-neutral-200 rounded-2xl">
          <div className="card-body">
            <h1 className="text-2xl font-semibold">My Orders</h1>
            <p className="opacity-70">Please sign in to view your orders.</p>
            <div className="mt-4">
              <form
                action={async () => {
                  "use server";
                  const { signInWithGoogle } = await import("@/lib/user-auth"); // ✅ your auth action
                  await signInWithGoogle();
                }}
              >
                <button type="submit" className="btn btn-neutral rounded-2xl">
                  Sign in with Google
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch orders for this user; include items + menuItem. (meta is on OrderItem)
  const orders = await prisma.order.findMany({
    where: { userEmail: email },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { menuItem: true } } },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className="opacity-70 text-sm">Track your recent orders and their status.</p>
      </header>

      {orders.length === 0 ? (
        <div className="card bg-base-100 border border-neutral-200 rounded-2xl">
          <div className="card-body">
            <p className="opacity-70">No orders yet.</p>
            <div className="mt-2">
              <Link href="/" className="btn btn-ghost rounded-2xl border border-neutral-200">
                Start an order
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <article key={o.id} className="card bg-base-100 border border-neutral-200 rounded-2xl">
              <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm opacity-70">Order</div>
                    <div className="font-semibold">#{o.id.slice(0, 8)}</div>
                    <div className="text-xs opacity-60 mt-1">{fmtDate(o.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={o.status as any} />
                    <div className="mt-1 font-semibold">{formatUSD(o.subtotalCents)}</div>
                  </div>
                </div>

                <div className="divider my-2" />

                {/* Items + meta */}
                <div className="space-y-2">
                  {o.items.map((it) => {
                    const meta = (it as any).meta || {};
                    const size = typeof meta.size === "string" ? meta.size : undefined;
                    const addonIds: string[] = Array.isArray(meta.addonIds) ? meta.addonIds : [];
                    const addonLabels: Record<string, string> = meta.addonLabels || {};
                    const addonPrices: Record<string, number> = meta.addonPrices || {};
                    const notes = typeof meta.notes === "string" ? meta.notes.trim() : "";

                    return (
                      <div key={it.id} className="grid grid-cols-[1fr,auto] gap-2 text-sm">
                        <div>
                          <div className="font-medium">
                            {it.menuItem?.name ?? "Item"}
                            {size ? <span className="opacity-70"> — {size}</span> : null}
                          </div>

                          {addonIds.length > 0 && (
                            <ul className="mt-1 space-y-1 text-xs">
                              {addonIds.map((aid) => (
                                <li key={aid} className="flex items-center gap-2 opacity-80">
                                  <span>{addonLabels[aid] ?? "Add-on"}</span>
                                  <span className="opacity-60">
                                    +${((addonPrices[aid] ?? 0) / 100).toFixed(2)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {notes && <div className="text-xs opacity-60 mt-1">“{notes}”</div>}

                          <div className="text-xs opacity-70 mt-1">Qty {it.qty}</div>
                        </div>

                        <div className="text-right font-medium">
                          {formatUSD(it.unitPriceCents * it.qty)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <Link href="/" className="btn btn-ghost rounded-2xl border border-neutral-200">
                    Reorder
                  </Link>

                  {o.status === "PENDING" ? (
                    <form action={cancelMyPendingOrder}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <button className="btn btn-outline rounded-2xl border-neutral-200" type="submit">
                        Cancel order
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
