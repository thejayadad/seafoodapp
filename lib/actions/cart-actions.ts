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


export async function removeAddonFromLine(formData: FormData) {
  const lineId = String(formData.get("lineId"));
  const addonId = String(formData.get("addonId"));

  const cart = await readCart();
  const line: any = cart.lines.find((l) => l.id === lineId);
  if (!line) return;

  const price = line.meta?.addonPrices?.[addonId] ?? 0;

  // Subtract add-on price from unit price
  line.unitPriceCents = Math.max(0, Number(line.unitPriceCents) - Number(price));

  // Remove add-on id/label/price from meta
  if (Array.isArray(line.meta?.addonIds)) {
    line.meta.addonIds = line.meta.addonIds.filter((id: string) => id !== addonId);
  }
  if (line.meta?.addonLabels) {
    delete line.meta.addonLabels[addonId];
  }
  if (line.meta?.addonPrices) {
    delete line.meta.addonPrices[addonId];
  }

  await writeCart(cart);
}
