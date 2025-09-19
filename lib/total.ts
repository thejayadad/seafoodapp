import type { Cart } from "@/lib/cart";

/** Basic restaurant-ish totals; tweak as needed */
export function computeTotals(cart: Cart) {
  const subtotalCents = cart.lines.reduce(
    (sum, l) => sum + l.unitPriceCents * l.qty,
    0
  );

  // Example knobs (adjust per city/menu rules)
  const taxRate = 0.08875; // 8.875%
  const taxCents = Math.round(subtotalCents * taxRate);

  const feesCents = 0; // add delivery fee, packaging, etc. when needed

  const totalCents = subtotalCents + taxCents + feesCents;
  return { subtotalCents, taxCents, feesCents, totalCents, taxRate };
}
