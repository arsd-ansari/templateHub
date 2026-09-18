import { cache } from "react";
import { prisma } from "@/prisma/client";
import type { SortOption } from "@/types";

export async function getTemplateCategories() {
  return prisma.templateCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { templates: true } } }
  });
}

export async function getTemplateSlugs() {
  const templates = await prisma.template.findMany({ select: { slug: true } });
  return templates.map((template) => template.slug);
}

export async function getTemplates({
  query = "",
  category,
  sort = "latest",
  page = 1,
  pageSize = 12
}: {
  query?: string;
  category?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}) {
  const where = {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } }
          ]
        }
      : {}),
    ...(category ? { category: { slug: category } } : {})
  };

  const [items, total] = await Promise.all([
    prisma.template.findMany({
      where,
      include: { category: true, tags: true },
      orderBy: sort === "popular" ? { downloadCount: "desc" } : { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.template.count({ where })
  ]);
  return { items, total, page, pageSize };
}

export const getTemplateBySlug = cache(async (slug: string) => {
  return prisma.template.findUnique({
    where: { slug },
    include: { category: true, tags: true }
  });
});

export async function getRelatedTemplates(categoryId: string, slug: string) {
  return prisma.template.findMany({
    where: { categoryId, slug: { not: slug } },
    include: { category: true },
    orderBy: { downloadCount: "desc" },
    take: 3
  });
}

export async function getTopTemplates(limit = 6) {
  return (await getTemplates({ sort: "popular", pageSize: limit })).items;
}
