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

// Reading is allowed in RSC & Server Actions
export async function readCart(): Promise<Cart> {
  const store = cookies();
  const raw = (await store).get(COOKIE_KEY)?.value;
  if (!raw) return { lines: [] };
  try {
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed?.lines) return { lines: [] };
    return parsed;
  } catch {
    return { lines: [] };
  }
}

/** WRITE: MUST be invoked from a Server Action or Route Handler */
export async function writeCart(cart: Cart) {
  "use server";
  (await cookies()).set(COOKIE_KEY, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

/** CLEAR: MUST be invoked from a Server Action or Route Handler */
export async function clearCart() {
  "use server";
  (await cookies()).set(COOKIE_KEY, JSON.stringify({ lines: [] }), {
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
