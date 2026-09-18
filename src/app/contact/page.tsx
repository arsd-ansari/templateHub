import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { CONTACT_EMAIL, SITE_AUTHOR } from "@/constants/site";

export const metadata: Metadata = {
  title: "Contact TemplateHub",
  description:
    "Email TemplateHub about GST template errors, missing fields, spreadsheet requests, or corrections to the guides. Replies go to the editor who builds the files."
};

export default function ContactPage() {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Contact TemplateHub</h1>
      <p className="mt-3 text-lg leading-8 text-[var(--muted-foreground)]">
        Write if a formula is wrong, a GST field is missing, a guide needs a correction, or you want a spreadsheet that is not in the library yet.
      </p>

      <div className="prose mt-8">
        <p>
          Mail goes to <strong>{SITE_AUTHOR.name}</strong>, who builds the Excel files. Use a subject line that names the page (for example “RCM self invoice — IGST row”). Include the Excel version or whether you opened the file in Google Sheets — that is usually enough to reproduce a formula bug.
        </p>
        <p>
          Email directly: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. There is no ticket queue and no chatbot. I do not sell leads from this form.
        </p>
        <h2>What I can help with</h2>
        <ul>
          <li>Broken CGST/SGST formulas or print layout on a published template.</li>
          <li>A field that GST law requires but the sheet does not show.</li>
          <li>Requests for formats we do not yet publish (attendance, stock register, quotation).</li>
          <li>Permission questions: yes, you may use the files for client work; no, you may not resell the blank template as a paid download.</li>
        </ul>
        <p>
          For how files are tested before they go live, see{" "}
          <Link href="/how-we-build">how we build templates</Link>. For who runs the site, see{" "}
          <Link href="/about">About</Link>.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
