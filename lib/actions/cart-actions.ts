// src/components/order/actions.ts
"use server";

import { fetchItemLine, readCart, writeCart, clearCart } from "@/lib/cart";

export async function addToCart(formData: FormData) {
  const menuItemId = String(formData.get("menuItemId"));
  const qty = Math.max(1, Number(formData.get("qty") ?? 1));
  const line = await fetchItemLine(menuItemId, qty);

  const cart = await readCart();
  const existing = cart.lines.find((l) => l.menuItemId === line.menuItemId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.lines.unshift(line);
  }
  await writeCart(cart);
}

export async function removeLine(formData: FormData) {
  const lineId = String(formData.get("lineId"));
  const cart = await readCart();
  cart.lines = cart.lines.filter((l) => l.id !== lineId);
  await writeCart(cart);
}

export async function setQty(formData: FormData) {
  const lineId = String(formData.get("lineId"));
  const qty = Math.max(1, Number(formData.get("qty") ?? 1));
  const cart = await readCart();
  const line = cart.lines.find((l) => l.id === lineId);
  if (line) line.qty = qty;
  await writeCart(cart);
}

export async function clearCartAction() {
  await clearCart();
}
