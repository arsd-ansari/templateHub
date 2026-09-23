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
    "One-time ₹299 Excel pack: GST invoice, RCM self invoice, payment voucher, plus pack-only IGST invoice, GTA worked example, and RCM register.",
  alternates: { canonical: GST_PACK.href }
};

const INCLUDED = [
  { name: "GST tax invoice (CGST + SGST)", extra: false, href: "/templates/gst-invoice-template" },
  { name: "RCM self invoice", extra: false, href: "/templates/self-invoice-rcm-template" },
  { name: "RCM payment voucher", extra: false, href: "/templates/rcm-payment-voucher-template" },
  { name: "Inter-state IGST tax invoice", extra: true },
  { name: "Filled GTA freight example (₹18,500 at 5%)", extra: true },
  { name: "RCM document register (SI + PV log)", extra: true }
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
            "One-time ₹299 Excel pack: GST invoice, RCM files, IGST invoice, GTA example, and RCM register.",
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
        One zip, ₹{GST_PACK.priceInr} once. The three free GST files stay free on the site. Buyers get those plus three pack-only workbooks: IGST invoice, a filled GTA example, and a register that joins self invoice and payment voucher numbers.
      </p>

      <ul className="mt-8 grid gap-3">
        {INCLUDED.map((item) => (
          <li key={item.name} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm leading-6">
            <strong>{item.name}</strong>
            {item.extra ? (
              <span className="ml-2 text-[var(--muted-foreground)]">Pack only</span>
            ) : (
              <span className="ml-2 text-[var(--muted-foreground)]">
                Also free — {item.href ? <Link className="text-[var(--primary)]" href={item.href}>open page</Link> : null}
              </span>
            )}
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
