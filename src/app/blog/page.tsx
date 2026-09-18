import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/blog-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getBlogPosts } from "@/services/blog-service";

export const metadata: Metadata = {
  title: "Excel Spreadsheet Blog",
  description:
    "Original Excel guides from TemplateHub: GST Rule 46 checklists, RCM worked examples, cash-book vs P&L, and how we test files in Sheets and LibreOffice."
};

export const revalidate = 1800;

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const posts = await getBlogPosts({ query: params.q || "", page, pageSize: 24 });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">TemplateHub Blog</h1>
      <p className="mt-3 max-w-3xl leading-8 text-[var(--muted-foreground)]">
        Written guides that sit next to the downloads: Rule 46 field checklists, a GTA freight self-invoice with rupee amounts, Excel vs Google Sheets test notes, and the three-file bookkeeping stack for a new Indian firm. Each article is by Arshad Ansari and is updated in place when a rule or formula changes.
      </p>
      <form className="mt-6 flex max-w-xl gap-2">
        <Input name="q" defaultValue={params.q || ""} placeholder="Search blog articles" />
        <Button type="submit">Search</Button>
      </form>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.items.map((post) => <BlogCard key={post.slug} post={post} />)}
      </div>
    </div>
  );
}
