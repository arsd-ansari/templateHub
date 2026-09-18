import { Card } from "@/components/ui/card";
import { prisma } from "@/prisma/client";

export default async function AdminAnalyticsPage() {
  const data = process.env.DATABASE_URL
    ? await prisma.template.findMany({ orderBy: [{ viewCount: "desc" }, { downloadCount: "desc" }], take: 10 }).catch(() => [])
    : [];
  return (
    <Card className="p-5">
      <h2 className="font-bold">Analytics</h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">Downloads, page views, and popular pages. Connect Plausible, GA4, or server-side event storage here as traffic grows.</p>
      <div className="mt-5 grid gap-2">
        {data.map((template) => (
          <div key={template.slug} className="grid grid-cols-[1fr_90px_90px] rounded-md border border-[var(--border)] p-3 text-sm">
            <span>{template.title}</span>
            <span>{template.viewCount} views</span>
            <span>{template.downloadCount} downloads</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
