import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_AUTHOR, SITE_URL } from "@/constants/site";

const PAGE_DESCRIPTION =
  "The checklist TemplateHub uses before publishing a free Excel template: legal fields, formulas that work in Sheets, A4 print, sample rows, and a written guide.";

export const metadata: Metadata = {
  title: "How We Build Excel Templates",
  description: PAGE_DESCRIPTION
};

const STEPS = [
  {
    name: "Pick one job for the workbook",
    text: "A file is either a GST tax invoice, an RCM self invoice, an RCM payment voucher, a cash book, or a P&L — not all of those at once. Mixed-purpose sheets hide the wrong fields and fail the first audit question: what is this document?"
  },
  {
    name: "List the mandatory fields first",
    text: "For GST invoices that list is CGST Rule 46. For RCM self invoices it is Section 31(3)(f) plus a Reverse Charge flag. For RCM payment vouchers it is Section 31(3)(g) and Rule 52. For salary slips it is earnings, statutory deductions, and net pay. Labels go on the sheet before any formatting."
  },
  {
    name: "Write formulas a Sheets user can keep",
    text: "Quantity × rate, tax = taxable × rate / 2 for CGST/SGST, SUM for totals. No VBA, no XLOOKUP-only logic, no macros. If LibreOffice drops the formula, the sheet is redesigned."
  },
  {
    name: "Leave a completed sample",
    text: "Reviewers and first-time users need to see a filled invoice, not a grid of zeros. Sample GSTIN-style placeholders sit in [square brackets] so you know what to overwrite."
  },
  {
    name: "Print to A4 and export PDF",
    text: "Indian invoices still travel as printouts and WhatsApp PDFs. Print titles, margins, and amount-in-words are checked so a 6-line invoice does not spill onto a second blank page."
  },
  {
    name: "Write the page that explains the file",
    text: "The download is not the article. Each template page states when the file applies, when it does not (for example: do not use a tax invoice for unregistered RCM), and a numeric example."
  }
];

export default function HowWeBuildPage() {
  return (
    <div className="container max-w-3xl py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How TemplateHub builds an Excel template",
          description: PAGE_DESCRIPTION,
          url: `${SITE_URL}/how-we-build`,
          author: { "@type": "Person", name: SITE_AUTHOR.name },
          step: STEPS.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.name,
            text: step.text
          }))
        }}
      />
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/">Home</Link> / How we build templates
      </p>
      <h1 className="mt-4 text-3xl font-bold">How we build Excel templates</h1>
      <p className="mt-4 text-lg leading-8 text-[var(--muted-foreground)]">
        TemplateHub is not a dump of generic .xlsx files. {SITE_AUTHOR.name} designs each workbook for one compliance or bookkeeping job, then publishes the method next to the download so you can judge the file before you trust it with a GSTIN.
      </p>

      <div className="prose mt-8">
        <h2>Why this page exists</h2>
        <p>
          AdSense and search reviewers (and you) should be able to see that the site is a maintained library with a named editor, not an auto-generated download mill. The steps below are the same ones used for the{" "}
          <Link href="/templates/gst-invoice-template">GST invoice</Link>,{" "}
          <Link href="/templates/self-invoice-rcm-template">RCM invoice format</Link>, and{" "}
          <Link href="/templates/rcm-payment-voucher-template">RCM payment voucher</Link> files that are already live.
        </p>

        <h2>The publishing checklist</h2>
        {STEPS.map((step, index) => (
          <div key={step.name}>
            <h3>
              {index + 1}. {step.name}
            </h3>
            <p>{step.text}</p>
          </div>
        ))}

        <h2>What we test in three apps</h2>
        <p>
          Microsoft Excel (Microsoft 365) is the source file. The same .xlsx is uploaded to Google Sheets and opened in LibreOffice Calc. Failures we have already caught and redesigned for: currency formats that become USD in Sheets, named ranges that LibreOffice ignores, and merged header cells that break SUM when you insert a line item.
        </p>
        <p>
          Dropdowns use plain data-validation lists, not Excel Tables that refuse to open elsewhere. Dates are real date values, not text, so a cash book running balance still sorts.
        </p>

        <h2>Worked numbers, not empty theory</h2>
        <p>
          Guides include at least one arithmetic example — an 18% intra-state line that splits 9% + 9%, or a GTA freight self invoice at 5%. If the article cannot show the rupee amounts, it is not published. That is also why we refuse to clone the same invoice ten times with different H1 tags.
        </p>

        <h2>Corrections</h2>
        <p>
          Law and Excel both change. If a field is missing or a formula rounds CGST incorrectly, use the{" "}
          <Link href="/contact">contact page</Link>. The template page is updated in place; the URL stays the same so existing downloads and search listings do not break.
        </p>
      </div>
    </div>
  );
}
