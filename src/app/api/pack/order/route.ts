import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { GST_PACK } from "@/constants/pack";
import { createRazorpayOrder, razorpayConfigured, razorpayPublicKey } from "@/lib/razorpay";
import { prisma } from "@/prisma/client";

const bodySchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (!razorpayConfigured()) {
    return NextResponse.json(
      { error: "Payments are not connected yet. Email hello@templatehub.co.in to buy the pack." },
      { status: 503 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const downloadToken = randomBytes(24).toString("hex");
  const purchase = await prisma.packPurchase.create({
    data: {
      email,
      packSlug: GST_PACK.slug,
      status: "pending",
      downloadToken
    }
  });

  try {
    const order = await createRazorpayOrder(GST_PACK.pricePaise, purchase.id.slice(0, 40), {
      email,
      pack: GST_PACK.slug
    });
    await prisma.packPurchase.update({
      where: { id: purchase.id },
      data: { razorpayOrderId: order.id }
    });
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: razorpayPublicKey(),
      email
    });
  } catch (error) {
    await prisma.packPurchase.delete({ where: { id: purchase.id } }).catch(() => undefined);
    const message = error instanceof Error ? error.message : "Could not start payment.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
