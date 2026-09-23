import Link from "next/link";
import { ArrowRight, Download, Search, Sparkles } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { JsonLd } from "@/components/seo/json-ld";
import { TemplateCard } from "@/components/templates/template-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Metadata } from "next";
import { getLatestBlogPosts } from "@/services/blog-service";
import { getTemplateBySlug, getTemplateCategories, getTemplates, getTopTemplates } from "@/services/template-service";
import { SITE_DESCRIPTION } from "@/constants/site";

const HOME_FAQS = [
  {
    question: "Are TemplateHub's Excel templates really free?",
    answer: "Yes. Every template on TemplateHub is 100% free to download and use, including for commercial and business purposes. No sign-up, no credit card, no email required."
  },
  {
    question: "Do I need Microsoft Excel to use these templates?",
    answer: "No. All templates are provided as .xlsx files that also open in Google Sheets, LibreOffice Calc, WPS Spreadsheets, and Apple Numbers. Formulas and formatting are preserved across most spreadsheet apps."
  },
  {
    question: "Can I edit and customise the templates?",
    answer: "Yes. Templates are fully unlocked. You can change branding, colours, columns, tax rates, and formulas to match your business."
  },
  {
    question: "Can I use TemplateHub templates for my business or clients?",
    answer: "Yes. Templates are free for personal, freelance, and commercial use. You can use them for your own company, resell your services using them, or share edited versions with clients."
  },
  {
    question: "What kinds of templates are available?",
    answer: "TemplateHub focuses on business-critical spreadsheets: GST invoices, RCM invoice format (self invoice) and payment vouchers for unregistered suppliers, general invoices, cash books, profit and loss statements, expense trackers, salary slips, and Excel formula guides like VLOOKUP. New templates are added regularly."
  },
  {
    question: "Who writes the templates and guides?",
    answer: "Arshad Ansari, a software engineer. Each workbook is labelled to the job it performs (GST invoice vs RCM self invoice vs cash book), tested in Excel, Google Sheets, and LibreOffice, and published with a written explainer. Corrections go to the contact page."
  },
  {
    question: "Do you have an RCM invoice format in Excel?",
    answer: "Yes. Download the free RCM invoice format (self invoice under GST) for unregistered dealer purchases, GTA freight, and advocate fees. When you pay the supplier, use the matching RCM payment voucher. Both files auto-calculate CGST and SGST."
  }
];

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "TemplateHub — Free Excel Templates for GST, Invoices & Accounting" },
  description: SITE_DESCRIPTION
};

export default async function HomePage() {
  const [featured, popular, categories, posts, gstInvoice, rcmInvoice, rcmVoucher] = await Promise.all([
    getTemplates({ pageSize: 6 }),
    getTopTemplates(5),
    getTemplateCategories(),
    getLatestBlogPosts(6),
    getTemplateBySlug("gst-invoice-template"),
    getTemplateBySlug("self-invoice-rcm-template"),
    getTemplateBySlug("rcm-payment-voucher-template")
  ]);
  const gstPicks = [gstInvoice, rcmInvoice, rcmVoucher].filter((item): item is NonNullable<typeof item> => Boolean(item));
  const liveCategories = categories.filter((category) => category._count.templates > 0);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HOME_FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer }
          }))
        }}
      />
      <section className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="container grid gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-sm text-[var(--muted-foreground)]">
              <Sparkles size={15} /> TemplateHub — free Excel & Google Sheets downloads
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              Free Excel Templates for GST, Invoices & Accounting
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
              Download GST invoices, RCM self invoices, expense trackers, payroll, and budget spreadsheets. Every file is free .xlsx for Excel and Google Sheets.
            </p>
            <form action="/search" className="mt-8 flex max-w-2xl gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
              <Input name="q" placeholder="Search RCM invoice format, GST invoice, budget..." className="border-0 bg-transparent" />
              <Button type="submit">
                <Search size={17} /> Search
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link href="/templates/gst-invoice-template" className="text-[var(--primary)] underline-offset-4 hover:underline">GST Invoice</Link>
              <Link href="/templates/self-invoice-rcm-template" className="text-[var(--primary)] underline-offset-4 hover:underline">RCM Invoice Format</Link>
              <Link href="/templates/rcm-payment-voucher-template" className="text-[var(--primary)] underline-offset-4 hover:underline">RCM Payment Voucher</Link>
              <Link href="/categories/gst-templates" className="text-[var(--primary)] underline-offset-4 hover:underline">All GST templates</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/templates">Browse Templates</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/blog">Read Guides</Link>
              </Button>
            </div>
          </div>
          <Card className="grid content-between p-6">
            <div>
              <div className="text-sm font-semibold text-[var(--muted-foreground)]">Trending downloads</div>
              <div className="mt-4 grid gap-3">
                {popular.map((template, index) => (
                  <Link key={template.slug} href={`/templates/${template.slug}`} className="flex items-center justify-between rounded-md border border-[var(--border)] p-3 hover:bg-[var(--muted)]">
                    <span className="font-medium">{index + 1}. {template.title}</span>
                    <span className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]"><Download size={14} /> {template.downloadCount}</span>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {gstPicks.length > 0 ? (
        <section className="container py-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">GST Invoice Templates (India)</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Tax invoice for registered sales, plus the RCM invoice format (self invoice) and payment voucher for Reverse Charge.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/categories/gst-templates">GST category <ArrowRight size={16} /></Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gstPicks.map((template) => <TemplateCard key={template.slug} template={template} />)}
          </div>
        </section>
      ) : null}

      <section className="container py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Featured Templates</h2>
            <p className="mt-2 text-[var(--muted-foreground)]">Ready-to-download spreadsheets for high-intent Google searches.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/templates">View all <ArrowRight size={16} /></Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.items.map((template) => <TemplateCard key={template.slug} template={template} />)}
        </div>
      </section>

      <section className="container py-10">
        <h2 className="text-2xl font-bold">How these spreadsheets are made</h2>
        <p className="mt-3 max-w-3xl leading-8 text-[var(--muted-foreground)]">
          Each file is built for one job (a GST tax invoice is not a cash book), labelled to the legal fields first, then tested in Excel, Google Sheets, and LibreOffice. Sample rows show the arithmetic — for example 10 × ₹1,200 at 18% GST splits into CGST ₹1,080 and SGST ₹1,080. There is a named editor, not a bulk-upload folder.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/how-we-build">Read the publishing checklist <ArrowRight size={16} /></Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about">About the editor</Link>
          </Button>
        </div>
      </section>

      <section className="bg-[var(--card)] py-10">
        <div className="container">
          <h2 className="text-2xl font-bold">Popular Categories</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveCategories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="rounded-lg border border-[var(--border)] p-5 hover:bg-[var(--muted)]">
                <div className="font-semibold">{category.name}</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="text-2xl font-bold">Latest Spreadsheet Guides</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {posts.map((post) => <BlogCard key={post.slug} post={post} />)}
        </div>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/blog">All guides <ArrowRight size={16} /></Link>
          </Button>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">Everything you need to know about downloading and using TemplateHub Excel templates.</p>
        <div className="mt-6 grid gap-3">
          {HOME_FAQS.map((faq) => (
            <details key={faq.question} className="group rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold">
                {faq.question}
                <span className="text-[var(--muted-foreground)] transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
