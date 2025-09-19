Dockside Bites — Options Modal & Configured Pricing — Steps (since last TXT)
====================================================================================

Scope
-----
This document continues from the previous TXT doc and covers everything added AFTER that point:
a reusable item **Options Modal** (sizes, add‑ons, notes, qty), **configured pricing** via server actions, 
a tiny client-only helper to close the modal on submit, and **Order Summary** enhancements to display & remove add‑ons,
plus showing special instructions — all while staying SSR-first for data/logic.

Steps Covered
-------------

1) **Replace homepage “Add” with card→modal pattern**
   - Menu items open a modal instead of directly adding to cart.
   - Each card is wrapped in `<label htmlFor={modalId}>` to toggle a DaisyUI modal.

2) **Reusable Options Modal**
   - Shows required size options, optional add-ons, notes, and qty.
   - Sticky footer with qty selector and “Add to Order” button.
   - Hidden fields allow server action to compute deltas without client JS.

3) **Configured Pricing Server Action**
   - `addConfiguredToCart` computes size delta and add-on totals.
   - Stores metadata (`meta`) on each line with size, notes, addonIds, labels, and prices.
   - Uses a `configKey` to keep unique combinations separate.

4) **Close Modal on Submit**
   - `src/components/ui/modal-submit.tsx` closes the modal immediately before submitting the form.
   - Imported and used for the “Add to Order” button.

5) **Order Summary Enhancements**
   - Shows add-ons under each line with prices.
   - Each add-on has its own “Remove” button (posts to `removeAddonFromLine`).
   - Special instructions shown under add-ons if present.
   - Existing Qty update and Remove line actions kept.

6) **Remove Add-On Server Action**
   - `removeAddonFromLine` subtracts the price of one add-on and removes it from the metadata.
   - Updates the cart so the summary re-renders without that add-on.

7) **Visual Polish**
   - Consistent rounded corners, borders, and `h-11` height for balanced CTA/qty.
   - SSR-first: all pricing and state lives on the server, minimal client JS.

8) **Testing Checklist**
   - Add size and add-ons → correct subtotal reflects all choices.
   - Remove add-on → price decreases correctly.
   - Enter notes → displayed under the item in the summary.
   - Empty cart → “SeaNotice” empty state renders.
