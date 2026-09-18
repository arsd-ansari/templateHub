import { BlogAdminForm } from "@/components/admin/admin-form";
import { Card } from "@/components/ui/card";
import { prisma } from "@/prisma/client";
import { getBlogPosts } from "@/services/blog-service";

export default async function AdminBlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts({ pageSize: 20 }),
    process.env.DATABASE_URL
      ? prisma.blogCategory.findMany().catch(() => [{ id: "excel-guides", name: "Excel Guides" }])
      : Promise.resolve([{ id: "excel-guides", name: "Excel Guides" }])
  ]);
  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <BlogAdminForm categories={categories} />
      <Card className="p-5">
        <h2 className="font-bold">Blog posts</h2>
        <div className="mt-4 grid gap-2">
          {posts.items.map((post) => (
            <div key={post.slug} className="rounded-md border border-[var(--border)] p-3 text-sm">{post.title}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}
