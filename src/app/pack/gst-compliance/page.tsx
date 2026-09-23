import type { Metadata } from "next";
import Link from "next/link";
import { PackCheckout } from "@/components/pack/pack-checkout";
import { JsonLd } from "@/components/seo/json-ld";
import { GST_PACK } from "@/constants/pack";
import { SITE_URL } from "@/constants/site";
import { razorpayConfigured } from "@/lib/razorpay";

export const metadata: Metadata = {
  title: "GST Compliance Excel Pack — ₹299",
  description:
    "Paid extras only: IGST invoice, filled GTA RCM example, and SI/PV register. The free GST files stay free and are not in this zip.",
  alternates: { canonical: GST_PACK.href }
};

const INCLUDED = [
  { name: "Inter-state IGST tax invoice", note: "One IGST column. Use when the buyer is in another state." },
  { name: "Filled GTA freight example (₹18,500 at 5%)", note: "Shows cash to the GTA vs cash to the government, plus GSTR-3B tables." },
  { name: "RCM document register", note: "Year log that joins Self Invoice No. and Payment Voucher No." }
];

const FREE = [
  { name: "GST tax invoice (CGST + SGST)", href: "/templates/gst-invoice-template" },
  { name: "RCM self invoice", href: "/templates/self-invoice-rcm-template" },
  { name: "RCM payment voucher", href: "/templates/rcm-payment-voucher-template" }
];

export default function GstPackPage() {
  return (
    <div className="container max-w-3xl py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: GST_PACK.title,
          description:
            "Paid extras only: IGST invoice, GTA worked example, and RCM register. Free GST files are not included.",
          url: `${SITE_URL}${GST_PACK.href}`,
          offers: {
            "@type": "Offer",
            price: GST_PACK.priceInr,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock"
          }
        }}
      />
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/">Home</Link> / GST pack
      </p>
      <h1 className="mt-4 text-4xl font-bold leading-tight">{GST_PACK.title}</h1>
      <p className="mt-4 text-lg leading-8 text-[var(--muted-foreground)]">
        ₹{GST_PACK.priceInr} once for files that are <strong>not</strong> on the free pages: an IGST invoice, a filled GTA example, and an RCM register. The usual GST invoice, RCM self invoice, and payment voucher stay free — they are not in this zip.
      </p>

      <h2 className="mt-8 text-xl font-bold">In this zip</h2>
      <ul className="mt-4 grid gap-3">
        {INCLUDED.map((item) => (
          <li key={item.name} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm leading-6">
            <strong>{item.name}</strong>
            <span className="mt-1 block text-[var(--muted-foreground)]">{item.note}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-xl font-bold">Free on the site (not in the pack)</h2>
      <ul className="mt-4 grid gap-3">
        {FREE.map((item) => (
          <li key={item.name} className="rounded-lg border border-[var(--border)] px-4 py-3 text-sm leading-6">
            <Link className="font-semibold text-[var(--primary)]" href={item.href}>{item.name}</Link>
            <span className="ml-2 text-[var(--muted-foreground)]">Free download</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <PackCheckout paymentsReady={razorpayConfigured()} />
      </div>

      <div className="prose mt-10">
        <h2>What you can do with it</h2>
        <p>
          Use the files for your own business. Do not republish the zip or the pack-only sheets as a paid product on another site.
        </p>
        <h2>Not legal advice</h2>
        <p>
          Spreadsheets only. Confirm GST rates (especially GTA 5% vs 12%) with your CA. After you pay, you can describe another Excel sheet you need — we only build spreadsheets, nothing else.
        </p>
      </div>
    </div>
  );
}
