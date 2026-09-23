import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { AdSlot } from "@/components/layout/ad-slot";
import { PackCta } from "@/components/pack/pack-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { showGstPackCta } from "@/constants/pack";
import { ADSENSE_SLOTS, SITE_AUTHOR, SITE_URL } from "@/constants/site";
import { extractFaqsFromMarkdown } from "@/lib/faq";
import { getBlogPostBySlug, getBlogPostSlugs } from "@/services/blog-service";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.seoTitle, description: post.seoDescription, type: "article", url: `${SITE_URL}/blog/${post.slug}` },
    twitter: { card: "summary_large_image", title: post.seoTitle, description: post.seoDescription }
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  const faqs = extractFaqsFromMarkdown(post.content);
  const packRelated = showGstPackCta(`${post.slug} ${post.title}`);

  return (
    <div className="container py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.createdAt,
          dateModified: post.updatedAt,
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
          author: {
            "@type": "Person",
            name: SITE_AUTHOR.name,
            jobTitle: SITE_AUTHOR.role
          },
          publisher: {
            "@type": "Organization",
            name: "TemplateHub",
            url: SITE_URL
          }
        }}
      />
      {faqs.length > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer }
            }))
          }}
        />
      ) : null}
      <article className="mx-auto max-w-3xl">
        {post.category ? <Badge>{post.category.name}</Badge> : null}
        <h1 className="mt-4 text-4xl font-bold leading-tight">{post.title}</h1>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          By {SITE_AUTHOR.name}, {SITE_AUTHOR.role.toLowerCase()}.{" "}
          <Link href="/about" className="underline-offset-4 hover:underline">About the editor</Link>
        </p>
        <p className="mt-4 text-lg leading-8 text-[var(--muted-foreground)]">{post.excerpt}</p>
        <AdSlot slot={ADSENSE_SLOTS.inArticle} />
        <div className="prose rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        {packRelated ? (
          <div className="mt-8">
            <PackCta />
          </div>
        ) : null}
      </article>
    </div>
  );
}
