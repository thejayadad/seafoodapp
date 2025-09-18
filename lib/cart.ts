// src/lib/cart.ts
import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type CartLine = {
  id: string;
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  qty: number;
};
export type Cart = { lines: CartLine[] };

const COOKIE_KEY = "cart_v1";

// Normalize cookies() for both Server Components (sync) and Actions (async)
async function getCookieStore() {
  const c = cookies() as any;
  return typeof c.then === "function" ? await c : c;
}

export async function readCart(): Promise<Cart> {
  const store = await getCookieStore();
  const raw = store.get(COOKIE_KEY)?.value;
  if (!raw) return { lines: [] };
  try {
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed?.lines) return { lines: [] };
    return parsed;
  } catch {
    return { lines: [] };
  }
}

export async function writeCart(cart: Cart) {
  const store = await getCookieStore();
  store.set(COOKIE_KEY, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // maxAge: 60 * 60 * 24,
  });
}

export async function clearCart() {
  const store = await getCookieStore();
  store.set(COOKIE_KEY, JSON.stringify({ lines: [] }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export function totals(cart: Cart) {
  const subtotalCents = cart.lines.reduce(
    (sum, l) => sum + l.unitPriceCents * l.qty,
    0
  );
  return { subtotalCents };
}

export async function fetchItemLine(menuItemId: string, qty: number) {
  const item = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
  if (!item || !item.isAvailable) throw new Error("Item unavailable");
  return {
    id: crypto.randomUUID(),
    menuItemId: item.id,
    name: item.name,
    unitPriceCents: item.priceCents,
    qty,
  } as CartLine;
}
