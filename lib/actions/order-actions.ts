// src/lib/orders.ts
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export type ConfirmResult =
  | { ok: true; orderId: string; email?: string | null }
  | { ok: false; reason: string };

export async function confirmOrderFromStripeSession(sessionId: string): Promise<ConfirmResult> {
  if (!sessionId) return { ok: false, reason: "Missing session id" };

  // 1) Get the Stripe Checkout Session
  const chk = await stripe.checkout.sessions.retrieve(sessionId);

  // 2) Locate our order
  const order =
    (await prisma.order.findFirst({ where: { stripeSessionId: sessionId } })) ||
    (chk.metadata?.orderId
      ? await prisma.order.findUnique({ where: { id: String(chk.metadata.orderId) } })
      : null);

  if (!order) return { ok: false, reason: "Order not found for this session" };

  // 3) A session is paid when payment_status is 'paid',
  //    optionally also consider status === 'complete' as "done".
  const paid =
    chk.payment_status === "paid" ||
    chk.status === "complete";

  if (!paid) {
    return { ok: false, reason: "Payment not completed yet" };
  }

  // 4) Mark PAID if not already
  if (order.status !== "PAID") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });
  }

  // NOTE: DO NOT clear cart here (not a Server Action).
  return { ok: true, orderId: order.id, email: chk.customer_details?.email as string | undefined };
}


