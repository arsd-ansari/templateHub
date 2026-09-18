import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { CONTACT_EMAIL, SITE_AUTHOR, SITE_NAME, SITE_URL } from "@/constants/site";

export const metadata: Metadata = {
  title: "About TemplateHub",
  description:
    "TemplateHub is a free Excel template library for GST, accounting, payroll, and small-business spreadsheets, built and checked by software engineer Arshad Ansari."
};

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `About ${SITE_NAME}`,
          url: `${SITE_URL}/about`,
          mainEntity: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            email: CONTACT_EMAIL,
            founder: {
              "@type": "Person",
              name: SITE_AUTHOR.name,
              jobTitle: SITE_AUTHOR.role
            }
          }
        }}
      />
      <h1 className="text-3xl font-bold">About TemplateHub</h1>
      <p className="mt-4 text-lg leading-8 text-[var(--muted-foreground)]">
        TemplateHub publishes free, editable Excel workbooks for Indian GST compliance and everyday small-business bookkeeping — plus the written guides that explain when to use each file.
      </p>

      <div className="prose mt-8">
        <h2>Who runs this site</h2>
        <p>
          TemplateHub is built by <strong>{SITE_AUTHOR.name}</strong>, a {SITE_AUTHOR.role.toLowerCase()}. I write the templates in Excel, check the formulas in Google Sheets and LibreOffice Calc, then publish the same .xlsx file with a field-by-field guide. There is no template marketplace, no email wall, and no paid “pro” version sitting behind the free download.
        </p>
        <p>
          The site exists because most GST and bookkeeping Excel files online are either a screenshot with no formulas, or a locked sheet that breaks the moment you insert a row. The files here are unlocked, labelled, and meant to be edited.
        </p>

        <h2>What we publish (and what we do not)</h2>
        <p>
          The library is narrow on purpose: tax invoices, Reverse Charge self invoices, cash books, profit and loss, expense trackers, salary slips, rent receipts, and budgets. If a workbook cannot be explained in plain language — who fills which cell, which formula runs, and what goes wrong if you skip a field — it does not go live.
        </p>
        <p>
          We do not scrape other template sites. We do not ship 50 near-duplicate “invoice v2 / invoice v3” pages. We do not sell the same file under a new name. Each published template has its own legal context (for example CGST Rule 46 vs Section 31(3)(f) for RCM) and its own worked numbers.
        </p>

        <h2>How a file is checked before it is listed</h2>
        <p>
          Every workbook is opened in Microsoft Excel, uploaded to Google Sheets, and opened again in LibreOffice. Formulas that rely on Excel-only functions are rejected. Print layout is checked at A4. Sample rows are left in so you can see a completed example before you overwrite it. The full checklist is on the{" "}
          <Link href="/how-we-build">how we build templates</Link> page.
        </p>

        <h2>Who the templates are for</h2>
        <ul>
          <li>Registered GST businesses that still raise invoices in Excel rather than billing software.</li>
          <li>Recipients who must issue a self invoice under Reverse Charge when the supplier has no GSTIN.</li>
          <li>Freelancers and shop owners who need a cash book and a monthly P&amp;L without a Tally licence.</li>
          <li>Employees claiming HRA who need a rent-receipt format a payroll team will accept.</li>
        </ul>
        <p>
          The files are free for personal and commercial use. You may rebrand them for your firm. You may not republish the unedited workbook as your own paid product.
        </p>

        <h2>Editorial standards</h2>
        <p>
          GST and payroll rules change. Guides on this site describe the rule as it is commonly applied in India, with the section or table number where it matters (Rule 46, GSTR-3B Table 3.1(d), HRA PAN threshold of ₹1,00,000 a year). They are not a substitute for a Chartered Accountant. If a page is wrong, email {CONTACT_EMAIL} with the URL and the correction — I update the page rather than leaving a stale FAQ live.
        </p>

        <h2>Contact</h2>
        <p>
          Template requests, formula bugs, and GST-format questions:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or the{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </div>
    </div>
  );
}
