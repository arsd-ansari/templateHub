import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { GST_PACK } from "@/constants/pack";
import { prisma } from "@/prisma/client";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (token.length < 20) {
    return NextResponse.json({ error: "Missing download token." }, { status: 400 });
  }

  const purchase = await prisma.packPurchase.findUnique({ where: { downloadToken: token } });
  if (!purchase || purchase.status !== "paid") {
    return NextResponse.json({ error: "This download link is not valid." }, { status: 404 });
  }

  const zipPath = path.join(process.cwd(), "content", "packs", GST_PACK.zipFileName);
  let bytes: Buffer;
  try {
    bytes = await readFile(zipPath);
  } catch {
    return NextResponse.json({ error: "Pack file is missing on the server." }, { status: 500 });
  }

  await prisma.packPurchase.update({
    where: { id: purchase.id },
    data: { downloadCount: { increment: 1 } }
  });

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="templatehub-gst-compliance-pack.zip"',
      "Cache-Control": "no-store"
    }
  });
}
