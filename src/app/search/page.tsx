import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { globalSearch } from "@/services/search-service";

export const metadata: Metadata = {
  title: "Search Templates and Guides",
  description: "Search Excel templates, spreadsheet guides, blog articles, and categories on TemplateHub.",
  robots: { index: false, follow: true }
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const q = params.q || "";
  const results = await globalSearch(q);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Search TemplateHub</h1>
      <form className="mt-6 flex max-w-2xl gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={16} />
          <Input name="q" defaultValue={q} placeholder="Search templates, blog posts, categories" className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
      </form>
      <div className="mt-8 grid gap-3">
        {results.map((result) => (
          <Card key={`${result.type}-${result.slug}`} className="p-5">
            <div className="flex items-center gap-2">
              <Badge>{result.type}</Badge>
              <Link href={result.href} className="font-bold hover:text-[var(--primary)]">{result.title}</Link>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{result.description}</p>
          </Card>
        ))}
        {q && results.length === 0 ? <p className="text-[var(--muted-foreground)]">No results found.</p> : null}
      </div>
    </div>
  );
}
