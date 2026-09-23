import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { prisma } from "@/prisma/client";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(3),
  razorpay_payment_id: z.string().min(3),
  razorpay_signature: z.string().min(10)
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Payment details missing." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const purchase = await prisma.packPurchase.update({
    where: { razorpayOrderId: razorpay_order_id },
    data: {
      status: "paid",
      razorpayPaymentId: razorpay_payment_id
    }
  });

  return NextResponse.json({ token: purchase.downloadToken });
}
