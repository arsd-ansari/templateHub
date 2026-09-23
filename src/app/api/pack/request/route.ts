import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/prisma/client";

const bodySchema = z.object({
  token: z.string().min(20),
  request: z.string().trim().min(20).max(2000)
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Describe the Excel sheet you need in at least 20 characters." }, { status: 400 });
  }

  const purchase = await prisma.packPurchase.findUnique({
    where: { downloadToken: parsed.data.token }
  });
  if (!purchase || purchase.status !== "paid") {
    return NextResponse.json({ error: "Only paid pack buyers can send a request." }, { status: 403 });
  }

  await prisma.customTemplateRequest.create({
    data: {
      email: purchase.email,
      request: parsed.data.request,
      purchaseId: purchase.id
    }
  });

  return NextResponse.json({ ok: true });
}
