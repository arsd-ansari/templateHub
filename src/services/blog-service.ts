import { cache } from "react";
import { prisma } from "@/prisma/client";

export async function getBlogPosts({ query = "", page = 1, pageSize = 9 }: { query?: string; page?: number; pageSize?: number }) {
  const where = {
    published: true,
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { excerpt: { contains: query, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: { category: true, tags: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.blogPost.count({ where })
  ]);
  return { items, total, page, pageSize };
}

export const getBlogPostBySlug = cache(async (slug: string) => {
  return prisma.blogPost.findUnique({ where: { slug }, include: { category: true, tags: true } });
});

export async function getBlogPostSlugs() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true }
  });
  return posts.map((post) => post.slug);
}

export async function getLatestBlogPosts(limit = 3) {
  return (await getBlogPosts({ pageSize: limit })).items;
}
