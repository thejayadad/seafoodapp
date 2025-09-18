Dockside Bites — Steps Since Hero Section (SSR-only) — Documentation

Scope
-----
This doc summarizes everything we built AFTER adding the Hero, keeping the app SSR-first and minimal client code.
It includes the filter bar, category/search UX, sticky behavior, items grid, cookie cart with server actions,
an order summary “calculator,” and ocean-themed notices.

Dependencies
------------
- DaisyUI (already installed)
- lucide-react (for icons): npm i lucide-react

File Map (added/updated)
------------------------
src/
├─ app/
│  ├─ page.tsx                              # Home route with filters, grid, and summary rail
│  └─ _components/hero/…                    # (from earlier) Bullet, HeroTitle, HeroMeta, Hero
├─ components/
│  ├─ filters/
│  │  ├─ category-select.tsx               # Focus-based dropdown; shows selected category
│  │  ├─ data-fetchers.ts                  # getCategoriesBare(), getItemsByFilters()
│  │  ├─ order-summary.tsx                 # Collapsible calculator-style summary (SSR)
│  │  ├─ search-form.tsx                   # GET form + reset button
│  │  ├─ search-reset.tsx                  # Clears ?q but preserves ?cat
│  │  ├─ segmentedFulfillment.tsx          # Pickup/Delivery as links (SSR)
│  │  └─ timepill.tsx                      # “ASAP” pill
│  ├─ order/
│  │  ├─ item-card-add.tsx                 # Item card with SSR Add form
│  │  └─ actions.ts                        # Server actions: addToCart, setQty, removeLine, clearCartAction
│  └─ ui/
│     ├─ feed-wrapper.tsx                  # Left column wrapper (provided)
│     ├─ sticky-wrapper.tsx                # Right rail wrapper (provided)
│     └─ sea-notice.tsx                    # Ocean-themed alert for empty/unavailable states
└─ lib/
   ├─ cart.ts                               # Cookie cart helpers (async cookies fix included)
   └─ url.ts                                # homeHref() to build /?q=&cat=&mode=

Step-by-Step
------------
1) Home Route reads query params (SSR)
   - File: src/app/page.tsx
   - Reads searchParams { q, cat, mode } and calls getItemsByFilters({ q, cat }).
   - Uses Hero at top, then a sticky filter bar, then a 2-col layout (FeedWrapper left, StickyWrapper right).

2) Sticky Header + Sticky Filter Bar
   - Header: add `sticky top-0 z-50 bg-base-100/95 backdrop-blur` (in your Header.tsx).
   - Filter Bar: container with `sticky top-14 z-50 bg-white`; top offset matches header height (h-16 ≈ 64px).

3) Category Select (shows selected category + closes on outside click)
   - File: src/components/filters/category-select.tsx
   - Uses DaisyUI focus-based `.dropdown` (no <details>) so clicking outside closes.
   - Trigger shows current category label (or “Categories”).
   - Links built with homeHref({ q, cat: slug }) to avoid trailing `/?`.
   - All outlines/borders use border-neutral-200.

4) Search Form + Reset (SSR GET)
   - Files: search-form.tsx and search-reset.tsx
   - GET form with `action="/"`, keeps ?cat via hidden input.
   - Reset button clears only ?q while preserving ?cat via homeHref().

5) Segmented Pickup/Delivery + ASAP Pill (SSR links)
   - Files: segmentedFulfillment.tsx and timepill.tsx
   - Two links with join group; each preserves other params via homeHref().
   - ASAP is a static pill for now (no client state).

6) Items Grid with “Add” (SSR form → server action)
   - File: src/components/order/item-card-add.tsx
   - Renders name/desc/price and a small quantity input + “Add” submit button.
   - Form posts to addToCart server action (no client code).

7) Cookie Cart (Server-only, async cookies fix)
   - File: src/lib/cart.ts
   - Helpers: readCart(), writeCart(), clearCart(), totals(), fetchItemLine().
   - IMPORTANT: cookies() is async inside server actions; we normalized with getCookieStore() and made helpers async.
   - Call sites must `await readCart()` and `await writeCart()` (see actions.ts and order-summary.tsx).

8) Server Actions for Cart
   - File: src/components/order/actions.ts
   - addToCart(): fetches item, merges by menuItemId, writes cookie.
   - setQty(): updates line qty, removeLine(): removes a line, clearCartAction(): clears cart.
   - All functions are "use server" and await cart helpers.

9) Order Summary “Calculator” (collapsible, SSR-only)
   - File: src/components/filters/order-summary.tsx
   - Collapsible via <details>/<summary> (no JS).
   - Renders lines with price totals and small SSR forms for Qty Update/Remove/Clear.
   - Subtotal computed with totals(cart).
   - Borders/inputs use border-neutral-200.

10) Ocean Themed Notice (empty results, empty cart, or unavailable items)
   - File: src/components/ui/sea-notice.tsx
   - Props: message, icon ("fish" | "ship" | "waves"), tone ("neutral" | "info" | "warning").
   - Used in:
     • Home page when flatItems.length === 0 → friendly “out at sea” message.
     • Order summary when cart is empty.
     • (Optional) Unavailable item card states.

11) Home Route wiring all parts together
   - File: src/app/page.tsx
   - Imports CategorySelect, SearchForm, SegmentedFulfillment, TimePill, ItemCardAdd, OrderSummaryCard, SeaNotice.
   - Flattens items: const flatItems = categories.flatMap(c => c.items).
   - If flatItems.length === 0 → render <SeaNotice …/>, else render grid of <ItemCardAdd />.
   - Right rail uses <StickyWrapper><OrderSummaryCard /></StickyWrapper>.

Troubleshooting
---------------
- “Property 'get' does not exist on type 'Promise<ReadonlyRequestCookies>'”
  → Ensure lib/cart.ts uses async helpers and all reads/writes await cookies(). Update actions and components to `await readCart()`.
- Category links go to a blank page
  → Ensure homeHref() is used; avoid /? (trailing query). Verify tsconfig path alias and file actually exists under src/.
- Prisma filter crashes (empty OR)
  → In getItemsByFilters(), only add the OR array when q is truthy.
- Dropdown won’t close on outside click
  → Use DaisyUI focus dropdown with tabIndex on trigger and menu (as in category-select.tsx).

Design Consistency
------------------
- Borders: border-neutral-200 for buttons, inputs, cards, dropdowns.
- Sticky layers: header z-50, filter bar z-50 (or z-40), content below.
- Sizes: filter controls h-11, rounded-md; icons from lucide-react (h-4 w-4 typical).

Next Steps
----------
- Item detail page (/item/[slug]) with server action “Add” and back-link to filtered home.
- Stripe Checkout server action + webhook to mark orders PAID.
- Admin SSR pages for order management.
- Optional: tax, fees, tip lines in totals(); delivery toggle behavior and address capture (SSR forms).
