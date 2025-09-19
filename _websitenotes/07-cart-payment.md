Dockside Bites — Cart, Checkout & Success (No Webhook) — Steps (since last TXT)
=======================================================================================

Scope
-----
This document continues from **options_modal_configured_pricing_steps.txt** and covers everything added AFTER that point:
- SSR Cart page with totals and Stripe Checkout redirect
- Stripe client setup and env
- Totals/money helpers
- Server action to create a Checkout Session + pending Order
- Success page that confirms payment (no webhook) and clears cart via Server Actions
- Cookie write rules in Next.js (fixes)
- Minor UI/flow tweaks (summary “Checkout” → /cart)

Files Added/Updated (map)
-------------------------
env/.env.local
src/
├─ app/
│  ├─ cart/page.tsx                          # SSR Cart page: items, totals, Proceed to payment
│  └─ success/page.tsx                       # SSR Success page: confirm session, finalize via Server Actions
├─ components/
│  └─ filters/order-summary.tsx              # CTA → /cart (Link), unchanged totals display
├─ lib/
│  ├─ stripe.ts                              # Stripe singleton (no apiVersion literal to avoid TS mismatch)
│  ├─ money.ts                               # formatUSD(cents)
│  ├─ totals.ts                              # computeTotals(cart) {subtotal,tax,fees,total}
│  ├─ actions/
│  │  └─ checkout-actions.ts                 # createCheckoutSession() server action (redirects to Stripe)
│  ├─ orders.ts                              # confirmOrderFromStripeSession(sessionId) (no cookie writes)
│  └─ cart.ts                                # writeCart/clearCart are Server Actions; readCart unchanged

Environment
-----------
Add to **.env.local**:
- STRIPE_SECRET_KEY=sk_test_xxx
- STRIPE_PRICE_CURRENCY=usd
- STRIPE_SUCCESS_URL=http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}
- STRIPE_CANCEL_URL=http://localhost:3000/cart?status=cancel
# (Optional) STRIPE_WEBHOOK_SECRET only if you add webhooks later

Install:
- npm i stripe

Stripe Client
-------------
**src/lib/stripe.ts**
- Export a process-wide Stripe singleton.
- Omit the `apiVersion` option to avoid TS literal mismatch with your installed SDK.
  ```ts
  import Stripe from "stripe";
  const globalForStripe = globalThis as unknown as { stripe: Stripe | undefined };
  export const stripe = globalForStripe.stripe ?? new Stripe(process.env.STRIPE_SECRET_KEY!);
  if (process.env.NODE_ENV !== "production") globalForStripe.stripe = stripe;
  ```

Money & Totals Helpers
----------------------
**src/lib/money.ts**
- `formatUSD(cents) => "$X.XX"`

**src/lib/totals.ts**
- `computeTotals(cart)` returns `{ subtotalCents, taxCents, feesCents, totalCents, taxRate }`
- Example tax preset: 8.875% (adjust as needed). Fees currently 0.

Create Checkout Session (Server Action)
--------------------------------------
**src/lib/actions/checkout-actions.ts**
- `createCheckoutSession()`:
  1) Requires signed-in user (uses `auth()` for email).
  2) Reads cookie cart; if empty → redirect /cart.
  3) Creates a **PENDING Order** with OrderItems in Prisma (email-based relation).
  4) Builds Stripe `line_items` from cart (includes add-on labels in description).
  5) Creates Stripe Checkout session with success/cancel URLs from env.
  6) Saves `stripeSessionId` (+ optional `payment_intent`) on the Order.
  7) Redirects to Stripe.

Cart Page (SSR)
---------------
**src/app/cart/page.tsx**
- Left column: list each cart line with add-ons, notes, qty update, remove item.
- Right column: sticky summary card with Subtotal, Tax, Total and the **Proceed to payment** button (form → `createCheckoutSession`).
- If not signed in, shows a friendly notice to sign in.
- “Continue shopping” link → `/`.
- “Clear cart” form → existing clearCartAction.

Success Page (SSR, No Webhook, with Server Actions)
---------------------------------------------------
**src/app/success/page.tsx**
- URL: `/success?session_id=cs_...` (Stripe injects the session id via STRIPE_SUCCESS_URL).
- On load: calls `confirmOrderFromStripeSession(session_id)` to verify with Stripe and mark Order `PAID` if needed.
- Renders a friendly receipt: order id, items (qty x price), subtotal, status.
- Provides **two Server Actions** to finalize and clear the cart (because cookie writes must happen in actions):
  - `finalizeToHome(formData)` → confirm (idempotent) → `clearCart()` → redirect `/`
  - `finalizeToOrders(formData)` → confirm (idempotent) → `clearCart()` → redirect `/orders`
- Each form includes a hidden `sessionId` field.
- This keeps the design: card, banded sections, rounded-2xl, neutral borders.

Confirm Payment Helper (No Cookie Writes Here)
----------------------------------------------
**src/lib/orders.ts**
- `confirmOrderFromStripeSession(sessionId)`:
  - Retrieves the Stripe Checkout Session.
  - Locates Order by `stripeSessionId` (or `metadata.orderId` fallback).
  - Determines **paid** via `payment_status === "paid"` (and/or `status === "complete"`).
  - Updates Prisma Order → `PAID` if not already.
  - **Does not** clear cookies (that is done only in Server Actions).
  - Returns `{ ok, orderId, email } | { ok: false, reason }`.

Cookie Write Rules (Fixes)
--------------------------
**src/lib/cart.ts**
- `readCart()` can be called in RSC or actions (reads are allowed anywhere on the server).
- `writeCart(cart)` and `clearCart()` must be called **inside a Server Action** or **Route Handler**:
  ```ts
  export async function writeCart(cart: Cart) {
    "use server";
    cookies().set("cart_v1", JSON.stringify(cart), { httpOnly: true, sameSite: "lax", path: "/" });
  }
  export async function clearCart() {
    "use server";
    cookies().set("cart_v1", JSON.stringify({ lines: [] }), { httpOnly: true, sameSite: "lax", path: "/" });
  }
  ```
- All cart mutations in your app (configured add, qty set, remove line, remove add-on, clear cart, finalize on success) already run as Server Actions, so this aligns with framework rules.

UI/Flow Tweaks
--------------
**src/components/filters/order-summary.tsx**
- Replace the disabled “Checkout” button with a Link to **/cart** when the cart has items:
  ```tsx
  {cart.lines.length === 0 ? (
    <button className="btn btn-neutral btn-block rounded-2xl" disabled>Checkout</button>
  ) : (
    <Link href="/cart" className="btn btn-neutral btn-block rounded-2xl">Checkout</Link>
  )}
  ```

Testing Checklist
-----------------
1) Add items with size + add-ons + notes → see correct line totals in Cart and Summary.
2) Go to **/cart** → click **Proceed to payment** → redirected to Stripe.
3) After paying → redirected to **/success?session_id=...**; status shows, receipt renders.
4) Click **View my orders** or **Continue browsing**:
   - Server Action re-confirms, **clears cart**, redirects.
   - Back on `/` or `/orders`, the cart shows empty.
5) Stripe version/type errors: gone (no hard-coded apiVersion).
6) Cookie write errors: gone (writes happen only inside Server Actions).

Notes & Next
------------
- This “no webhook” flow is simpler and works great on stream. The only caveat is if the user never returns to `/success`, the Order may remain `PENDING` until they do (you can add a webhook later for full eventual consistency).
- Next steps: a simple `/orders` page (SSR) to list user orders, and an admin SSR dashboard to filter by status.
