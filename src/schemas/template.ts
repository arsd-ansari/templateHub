import { z } from "zod";

export const templateSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().min(20),
  content: z.string().min(20),
  categoryId: z.string().min(1),
  fileUrl: z.string().min(1, "Upload a template file or provide a file URL"),
  thumbnailUrl: z.string().optional().default(""),
  seoTitle: z.string().min(5),
  seoDescription: z.string().min(20),
  tags: z.string().optional()
});

export const blogPostSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(20),
  content: z.string().min(20),
  categoryId: z.string().min(1),
  featuredImage: z.string().optional(),
  seoTitle: z.string().min(5),
  seoDescription: z.string().min(20),
  tags: z.string().optional()
});

export const categorySchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  icon: z.string().min(2),
  description: z.string().min(10)
});
