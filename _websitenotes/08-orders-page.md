Dockside Bites — Orders Page & Cancel Action — Steps (since last TXT)
=============================================================================

Scope
-----
Build a **/orders** page that fetches orders for the signed‑in user by `userEmail` (from `auth()`), fully SSR, with a
**Cancel Order** Server Action for PENDING orders. Also include guidance to avoid the “functions passed to client components” error.

What We Added
-------------
1) **Orders list page (SSR)** at `/orders`
   - Reads the session with `auth()` and uses `session.user.email` to query orders.
   - Renders each order with status badge, created time, subtotal, and items (qty x price).
   - “Reorder” link back to `/`.
   - If not signed in, shows a friendly sign‑in prompt (posts to your `signInWithGoogle` action).

2) **Server Action to cancel an order you own**
   - `cancelMyPendingOrder(formData: FormData)` reads the `orderId` from a hidden input.
   - Verifies the order belongs to the session email and is `PENDING`.
   - Updates status to `CANCELED` and `revalidatePath("/orders")`.

3) **Form wiring (no function binding, no client components)**
   - Import the action and set `action={cancelMyPendingOrder}`.
   - Include `<input type="hidden" name="orderId" value={o.id} />` inside the form.
   - This avoids the “Functions cannot be passed directly to Client Components…” error.
   - If you *must* render inside a Client Component, wrap the `<form>` in a tiny Server Component (see notes).

File Map
--------
src/
├─ app/
│  └─ orders/
│     └─ page.tsx                     # SSR page that lists the current user’s orders and allows cancel if PENDING
└─ lib/
   └─ actions/
      └─ order-actions.ts             # Server Action: cancelMyPendingOrder(formData)

Code — Server Action
--------------------
File: **src/lib/actions/order-actions.ts**
```ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** Cancel a user's own PENDING order (reads orderId from FormData) */
export async function cancelMyPendingOrder(formData: FormData) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("Not authenticated");

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Missing orderId");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userEmail !== email) {
    throw new Error("Order not found");
  }
  if (order.status !== "PENDING") {
    // already processed; nothing to do
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELED" },
  });

  revalidatePath("/orders");
}
```

Code — Orders Page (SSR)
------------------------
File: **src/app/orders/page.tsx**
```tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/money";
import { cancelMyPendingOrder } from "@/lib/actions/order-actions";
import Link from "next/link";

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
              <form action={async () => { "use server"; const { signInWithGoogle } = await import("@/lib/actions/auth"); await signInWithGoogle(); }}>
                <button type="submit" className="btn btn-neutral rounded-2xl">Sign in with Google</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userEmail: email },           // userEmail from session
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
                <div className="space-y-2">
                  {o.items.map((it) => (
                    <div key={it.id} className="grid grid-cols-[1fr,auto] gap-2 text-sm">
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
```

Notes & Gotchas
---------------
- **Fetch-by-email**: The page uses `where: { userEmail: session.user.email }`, matching your earlier email‑based relation.
- **No function binding**: The action reads `orderId` from `FormData`. This avoids passing a bound function to any client component.
- **All SSR**: Keep the page as a Server Component (no `"use client"`). If you must trigger the action from a Client Component, wrap the `<form>` in a tiny Server Component (server-only button) and render that from the client.
- **Revalidate**: We call `revalidatePath("/orders")` so the page updates immediately after cancellation.

Testing Checklist
-----------------
1) Visit `/orders` while signed out → see the sign‑in prompt.
2) Sign in, go to `/orders` → your orders appear newest first.
3) For a `PENDING` order → click **Cancel order** → status updates to `CANCELED` without a page reload.
4) For `PAID` or `CANCELED` orders → no cancel button shown.
5) “Reorder” returns you to `/`.

