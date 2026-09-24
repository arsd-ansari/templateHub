import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AdSlot } from "@/components/layout/ad-slot";
import { PackCta } from "@/components/pack/pack-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { TemplateCard } from "@/components/templates/template-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SheetPreview } from "@/components/templates/sheet-preview";
import { ADSENSE_SLOTS, SITE_URL } from "@/constants/site";
import { categoryTint } from "@/lib/category-tint";
import { formatNumber } from "@/lib/utils";
import { getRelatedTemplates, getTemplateBySlug, getTemplateSlugs } from "@/services/template-service";
import type { FaqItem } from "@/types";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getTemplateSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) return {};
  return {
    title: template.seoTitle || template.title,
    description: template.seoDescription || template.description,
    alternates: { canonical: `/templates/${template.slug}` },
    openGraph: {
      title: template.seoTitle,
      description: template.seoDescription,
      url: `${SITE_URL}/templates/${template.slug}`,
      type: "article"
    },
    twitter: { card: "summary_large_image", title: template.seoTitle, description: template.seoDescription }
  };
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) notFound();
  const related = await getRelatedTemplates(template.categoryId, template.slug);
  const faqs = template.faqs as FaqItem[];

  return (
    <div className="container py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: template.title,
          description: template.description,
          url: `${SITE_URL}/templates/${template.slug}`,
          isAccessibleForFree: true,
          fileFormat: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          encodingFormat: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How to use ${template.title}`,
          description: template.description,
          totalTime: "PT10M",
          tool: [{ "@type": "HowToTool", name: "Microsoft Excel or Google Sheets" }],
          step: template.instructions.map((instruction, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: instruction.length > 80 ? `${instruction.slice(0, 77)}...` : instruction,
            text: instruction
          }))
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Templates", item: `${SITE_URL}/templates` },
            { "@type": "ListItem", position: 3, name: template.title, item: `${SITE_URL}/templates/${template.slug}` }
          ]
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") }
          }))
        }}
      />
      <div className="mb-5 text-sm text-[var(--muted-foreground)]">
        <Link href="/">Home</Link> / <Link href="/templates">Templates</Link> / {template.title}
      </div>
      <section className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <Badge>{template.category?.name}</Badge>
          <h1 className="mt-4 text-4xl font-bold leading-tight">{template.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted-foreground)]">{template.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href={`/api/download/${template.slug}`}><Download size={18} /> Download Free Template</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/templates">Browse more</Link>
            </Button>
          </div>
        </div>
        <Card className="p-6" style={{ borderTopColor: categoryTint(template.category?.slug), borderTopWidth: 4 }}>
          <SheetPreview label={`${template.title}.xlsx`} tint={categoryTint(template.category?.slug)} />
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between"><span>Downloads</span><strong>{formatNumber(template.downloadCount)}</strong></div>
            <div className="flex justify-between"><span>Format</span><strong>XLSX</strong></div>
            <div className="flex justify-between"><span>License</span><strong>Free</strong></div>
          </div>
        </Card>
      </section>

      <AdSlot slot={ADSENSE_SLOTS.inArticle} />

      <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="prose rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2>Template Overview</h2>
          <ReactMarkdown>{template.content}</ReactMarkdown>
          <h2>Features</h2>
          <ul>
            {template.features.map((feature) => (
              <li key={feature} className="flex gap-2"><CheckCircle2 size={18} className="mt-1 text-[var(--primary)]" /> {feature}</li>
            ))}
          </ul>
          <h2>Instructions</h2>
          <ol>
            {template.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}
          </ol>
          <h2>FAQ</h2>
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3>{faq.question}</h3>
              <ReactMarkdown>{faq.answer}</ReactMarkdown>
            </div>
          ))}
        </article>
        <aside className="space-y-4">
          {template.category?.slug === "gst-templates" ? <PackCta /> : null}
          <AdSlot slot={ADSENSE_SLOTS.sidebar} label="Sidebar AdSense-ready placement" />
          <Card className="p-5">
            <div className="font-semibold">How this file is checked</div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Formulas are ordinary Excel maths (no macros). The same .xlsx is opened in Microsoft Excel, Google Sheets, and LibreOffice before publish. GSTIN and invoice-number cells are stored as text so they are not corrupted.{" "}
              <Link href="/how-we-build" className="font-semibold text-[var(--primary)]">Publishing checklist</Link>
            </p>
          </Card>
        </aside>
      </section>

      <section className="py-10">
        <h2 className="text-2xl font-bold">Related Templates</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {related.map((item) => <TemplateCard key={item.slug} template={item} />)}
        </div>
      </section>
    </div>
  );
}
