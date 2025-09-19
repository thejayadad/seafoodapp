"use server";

import { fetchItemLine, readCart, writeCart } from "@/lib/cart";

function toNum(v: FormDataEntryValue | null | undefined) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function hashConfig(menuItemId: string, size?: string, addonIds?: string[], notes?: string) {
  const a = (addonIds ?? []).slice().sort().join(",");
  const n = (notes ?? "").trim();
  return `${menuItemId}::size=${size ?? ""}::addons=${a}::notes=${n}`;
}

export async function addConfiguredToCart(formData: FormData) {
  const menuItemId = String(formData.get("menuItemId"));
  const qty = Math.max(1, Number(formData.get("qty") ?? 1));
  const size = String(formData.get("size") || "default");
  const notes = String(formData.get("notes") || "").slice(0, 200);

  const base = await fetchItemLine(menuItemId, qty);

  // SIZE delta by chosen label (from hidden "size:<label>")
  const sizeDelta = toNum(formData.get(`size:${size}`));

  // ADD-ON IDs selected
  const selectedAddonIds = (formData.getAll("addons") as string[]) || [];

  // Compute totals and collect label/price maps
  let addonsDelta = 0;
  const addonPrices: Record<string, number> = {};
  const addonLabels: Record<string, string> = {};
  for (const id of selectedAddonIds) {
    const price = toNum(formData.get(`addon:${id}`));
    addonsDelta += price;
    addonPrices[id] = price;

    const label = formData.get(`label:addon:${id}`);
    if (typeof label === "string") addonLabels[id] = label;
  }

  const unitPriceCents = base.unitPriceCents + sizeDelta + addonsDelta;

  const line = {
    ...base,
    id: crypto.randomUUID(),
    qty,
    unitPriceCents,
    name: `${base.name} — ${size}`,
    configKey: hashConfig(menuItemId, size, selectedAddonIds, notes),
    meta: {
      size,
      notes,
      addonIds: selectedAddonIds,
      addonLabels, // id -> label
      addonPrices, // id -> cents
    },
  } as any;

  const cart = await readCart();
  const existing = (cart.lines as any[]).find((l) => l.configKey === line.configKey);
  if (existing) {
    existing.qty += qty;
  } else {
    (cart.lines as any[]).unshift(line);
  }
  await writeCart(cart);
}
