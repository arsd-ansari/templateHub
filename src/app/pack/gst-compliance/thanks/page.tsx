import type { Metadata } from "next";
import Link from "next/link";
import { CustomRequestForm } from "@/components/pack/custom-request-form";
import { Button } from "@/components/ui/button";
import { GST_PACK } from "@/constants/pack";
import { prisma } from "@/prisma/client";

export const metadata: Metadata = {
  title: "Download your GST pack",
  robots: { index: false, follow: false }
};

export default async function GstPackThanksPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token || "";
  const purchase = token
    ? await prisma.packPurchase.findUnique({ where: { downloadToken: token } })
    : null;
  const paid = Boolean(purchase && purchase.status === "paid");

  return (
    <div className="container max-w-2xl py-10">
      {paid ? (
        <>
          <h1 className="text-3xl font-bold">Payment received</h1>
          <p className="mt-4 leading-8 text-[var(--muted-foreground)]">
            Download the zip. It has the three free GST files plus the IGST invoice, the GTA worked example, and the RCM register. Bookmark this page or keep the email you paid with.
          </p>
          <Button asChild size="lg" className="mt-6">
            <a href={`/api/pack/download?token=${encodeURIComponent(token)}`}>Download GST pack zip</a>
          </Button>

          <section className="mt-10 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-bold">Need a custom Excel sheet?</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Describe only a spreadsheet. We will not run code, open other apps, or send anything except an .xlsx file.
            </p>
            <CustomRequestForm token={token} />
          </section>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold">Link not valid</h1>
          <p className="mt-4 leading-8 text-[var(--muted-foreground)]">
            This download page needs the token from a completed payment. If you paid, check the browser tab that Razorpay opened, or write to us with the payment id.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href={GST_PACK.href}>Back to the pack</Link>
          </Button>
        </>
      )}
    </div>
  );
}
