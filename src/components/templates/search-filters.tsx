"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchFilters({ categories }: { categories: Array<{ name: string; slug: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function submit(formData: FormData) {
    const params = new URLSearchParams(searchParams);
    const q = String(formData.get("q") || "");
    const category = String(formData.get("category") || "");
    const sort = String(formData.get("sort") || "latest");
    q ? params.set("q", q) : params.delete("q");
    category ? params.set("category", category) : params.delete("category");
    params.set("sort", sort);
    params.delete("page");
    router.push(`/templates?${params.toString()}`);
  }

  return (
    <form action={submit} className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:grid-cols-[1fr_220px_180px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={16} />
        <Input name="q" defaultValue={searchParams.get("q") || ""} placeholder="Search templates" className="pl-9" />
      </div>
      <select name="category" defaultValue={searchParams.get("category") || ""} className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <select name="sort" defaultValue={searchParams.get("sort") || "latest"} className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
        <option value="latest">Latest</option>
        <option value="popular">Popular</option>
      </select>
      <Button type="submit">Apply</Button>
    </form>
  );
}
