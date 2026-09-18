import { Download, FileSpreadsheet, Newspaper, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { prisma } from "@/prisma/client";

async function getMetrics() {
  if (!process.env.DATABASE_URL) {
    return { templates: 50, downloads: 0, posts: 20, topTemplates: [] };
  }
  try {
    const [templates, downloads, posts, topTemplates] = await Promise.all([
      prisma.template.count(),
      prisma.download.count(),
      prisma.blogPost.count(),
      prisma.template.findMany({ orderBy: { downloadCount: "desc" }, take: 5 })
    ]);
    return { templates, downloads, posts, topTemplates };
  } catch {
    return { templates: 50, downloads: 0, posts: 20, topTemplates: [] };
  }
}

export default async function AdminDashboardPage() {
  const metrics = await getMetrics();
  const cards = [
    { label: "Total templates", value: metrics.templates, icon: FileSpreadsheet },
    { label: "Total downloads", value: metrics.downloads, icon: Download },
    { label: "Blog posts", value: metrics.posts, icon: Newspaper },
    { label: "Growth-ready pages", value: metrics.templates + metrics.posts, icon: TrendingUp }
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((item) => (
          <Card key={item.label} className="p-5">
            <item.icon size={20} className="text-[var(--primary)]" />
            <div className="mt-3 text-3xl font-bold">{item.value}</div>
            <div className="text-sm text-[var(--muted-foreground)]">{item.label}</div>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <h2 className="font-bold">Top downloaded templates</h2>
        <div className="mt-4 grid gap-3">
          {metrics.topTemplates.map((template) => (
            <div key={template.slug} className="flex justify-between rounded-md border border-[var(--border)] p-3">
              <span>{template.title}</span>
              <strong>{template.downloadCount}</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
