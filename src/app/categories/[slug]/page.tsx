import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { TemplateCard } from "@/components/templates/template-card";
import { getCategoryContent } from "@/constants/category-content";
import { SITE_URL } from "@/constants/site";
import { getTemplateCategories, getTemplates } from "@/services/template-service";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getTemplateCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getTemplateCategories();
  const category = categories.find((item) => item.slug === slug);
  const content = getCategoryContent(slug);
  if (!category) return {};
  const title = `Free ${category.name} for Excel & Google Sheets`;
  const description = content.longDescription || category.description;
  return {
    title,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/categories/${category.slug}`,
      type: "website"
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categories, templatesResult] = await Promise.all([
    getTemplateCategories(),
    getTemplates({ category: slug, pageSize: 24 })
  ]);
  const category = categories.find((item) => item.slug === slug);
  const templates = templatesResult.items;
  const content = getCategoryContent(slug);
  const relatedCategories = content.relatedCategorySlugs
    .map((s) => categories.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="container py-10">
      {content.faqs.length > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: content.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer }
            }))
          }}
        />
      ) : null}

      <div className="mb-5 text-sm text-[var(--muted-foreground)]">
        <Link href="/">Home</Link> / <Link href="/templates">Templates</Link> / {category?.name}
      </div>

      <h1 className="text-4xl font-bold leading-tight">
        Free {category?.name || "Templates"} for Excel &amp; Google Sheets
      </h1>
      {content.longDescription ? (
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted-foreground)]">
          {content.longDescription}
        </p>
      ) : category?.description ? (
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted-foreground)]">
          {category.description}
        </p>
      ) : null}

      {content.intro.length > 0 ? (
        <section className="prose mt-8 max-w-3xl">
          {content.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ) : null}

      {templates.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Templates in this category</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.slug} template={template} />
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-10 max-w-3xl rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-bold">Downloadable files</h2>
          <p className="mt-3 leading-7 text-[var(--muted-foreground)]">
            There is no .xlsx in this category yet. The guide above is still meant to be used: copy the column layout into a blank workbook. Related downloads are linked at the bottom of this page.
          </p>
        </section>
      )}

      {content.whatToLookFor.length > 0 ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold">What to look for in a {category?.name.toLowerCase().replace(/ templates?$/, "")} template</h2>
          <ul className="mt-6 grid gap-3">
            {content.whatToLookFor.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                <span className="text-sm leading-6">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {content.faqs.length > 0 ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 grid gap-3">
            {content.faqs.map((faq) => (
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
      ) : null}

      {relatedCategories.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Related categories</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {relatedCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="rounded-lg border border-[var(--border)] p-5 transition hover:bg-[var(--muted)]"
              >
                <div className="font-semibold">{c.name}</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {c.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
