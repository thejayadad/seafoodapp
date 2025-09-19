
"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readCart, clearCart } from "@/lib/cart";
import { redirect } from "next/navigation";
import { computeTotals } from "../total";

type StripeLineItem = {
  price_data: {
    currency: string;
    product_data: { name: string; description?: string };
    unit_amount: number;
  };
  quantity: number;
};

function cartToStripeLineItems(cart: Awaited<ReturnType<typeof readCart>>): StripeLineItem[] {
  const currency = process.env.STRIPE_PRICE_CURRENCY || "usd";
  return cart.lines.map((l: any) => {
    const descParts: string[] = [];
    if (Array.isArray(l.meta?.addonIds) && l.meta.addonIds.length > 0) {
      const labels = l.meta.addonIds.map((id: string) => l.meta.addonLabels?.[id]).filter(Boolean);
      if (labels.length) descParts.push(`Add-ons: ${labels.join(", ")}`);
    }
    if (typeof l.meta?.notes === "string" && l.meta.notes.trim().length > 0) {
      descParts.push(`Notes: ${l.meta.notes.trim()}`);
    }

    return {
      price_data: {
        currency,
        product_data: {
          name: l.name,                          // includes size (e.g., “Lobster Roll — Large”)
          description: descParts.join(" • ") || undefined,
        },
        unit_amount: l.unitPriceCents,
      },
      quantity: l.qty,
    };
  });
}

/** Creates a pending Order then a Stripe Checkout session; redirects to Stripe */
export async function createCheckoutSession() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    throw new Error("You must be signed in to checkout.");
  }

  const cart = await readCart();
  if (!cart.lines.length) {
    redirect("/cart"); // nothing to pay
  }

  const { subtotalCents } = computeTotals(cart);

  // 1) Create a pending Order in DB (email-based relation)
  const order = await prisma.order.create({
    data: {
      userEmail: email,
      status: "PENDING",
      subtotalCents,
      items: {
        create: cart.lines.map((l) => ({
          menuItemId: l.menuItemId,
          qty: l.qty,
          unitPriceCents: l.unitPriceCents,
        })),
      },
    },
  });

  // 2) Build Stripe line items from cart
  const line_items = cartToStripeLineItems(cart);

  // 3) Create Stripe Checkout session
  const successUrl = process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/cart?status=success";
  const cancelUrl = process.env.STRIPE_CANCEL_URL || "http://localhost:3000/cart?status=cancel";

  const chk = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: successUrl,
    cancel_url: cancelUrl,
    // Attach our order id to the session for webhook reconciliation
    metadata: {
      orderId: order.id,
      userEmail: email,
    },
  });

  // 4) Save Stripe ids on Order
  await prisma.order.update({
    where: { id: order.id },
    data: {
      stripeSessionId: chk.id,
      stripePaymentIntentId: chk.payment_intent ? String(chk.payment_intent) : null,
    },
  });

  // NOTE: DO NOT clear cart yet; do it after webhook confirms payment.
  // If you prefer optimistic UX, you could clear and re-hydrate from webhook.

  redirect(chk.url!);
}
