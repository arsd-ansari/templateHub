import { prisma } from "@/prisma/client";
import type { SearchResult } from "@/types";

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const [templates, posts, categories] = await Promise.all([
    prisma.$queryRaw<Array<{ title: string; slug: string; description: string }>>`
      SELECT title, slug, description FROM "Template"
      WHERE to_tsvector('english', title || ' ' || description || ' ' || content) @@ plainto_tsquery('english', ${query})
      ORDER BY "downloadCount" DESC LIMIT 8
    `,
    prisma.$queryRaw<Array<{ title: string; slug: string; excerpt: string }>>`
      SELECT title, slug, excerpt FROM "BlogPost"
      WHERE published = true AND to_tsvector('english', title || ' ' || excerpt || ' ' || content) @@ plainto_tsquery('english', ${query})
      ORDER BY "createdAt" DESC LIMIT 8
    `,
    prisma.templateCategory.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 4
    })
  ]);
  return [
    ...templates.map((item) => ({ type: "template" as const, title: item.title, slug: item.slug, description: item.description, href: `/templates/${item.slug}` })),
    ...posts.map((item) => ({ type: "blog" as const, title: item.title, slug: item.slug, description: item.excerpt, href: `/blog/${item.slug}` })),
    ...categories.map((item) => ({ type: "category" as const, title: item.name, slug: item.slug, description: item.description, href: `/categories/${item.slug}` }))
  ];
}
