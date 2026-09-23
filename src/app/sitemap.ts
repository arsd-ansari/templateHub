import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/site";
import { getBlogPosts } from "@/services/blog-service";
import { getTemplateCategories, getTemplates } from "@/services/template-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [templates, posts, categories] = await Promise.all([
    getTemplates({ pageSize: 100 }),
    getBlogPosts({ pageSize: 100 }),
    getTemplateCategories()
  ]);

  return [
    "", "/templates", "/blog", "/about", "/contact", "/how-we-build", "/privacy", "/terms", "/pack/gst-compliance",
    ...templates.items.map((item) => `/templates/${item.slug}`),
    ...posts.items.map((item) => `/blog/${item.slug}`),
    ...categories.filter((item) => item._count.templates > 0).map((item) => `/categories/${item.slug}`)
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/templates") ? 0.9 : 0.7
  }));
}
