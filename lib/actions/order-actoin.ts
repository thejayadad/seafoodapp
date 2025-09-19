"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** Cancel a user's own PENDING order (reads orderId from FormData) */
export async function cancelMyPendingOrder(formData: FormData) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("Not authenticated");

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Missing orderId");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userEmail !== email) {
    throw new Error("Order not found");
  }
  if (order.status !== "PENDING") {
    // already processed; nothing to do
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELED" },
  });

  revalidatePath("/orders");
}
