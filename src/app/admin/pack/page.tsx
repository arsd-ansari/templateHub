import { Card } from "@/components/ui/card";
import { prisma } from "@/prisma/client";

export default async function AdminPackPage() {
  const [purchases, requests] = await Promise.all([
    prisma.packPurchase.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.customTemplateRequest.findMany({ orderBy: { createdAt: "desc" }, take: 30 })
  ]);

  return (
    <div className="grid gap-6">
      <Card className="p-5">
        <h2 className="font-bold">GST pack purchases</h2>
        <div className="mt-4 grid gap-3 text-sm">
          {purchases.length === 0 ? <p className="text-[var(--muted-foreground)]">None yet.</p> : null}
          {purchases.map((item) => (
            <div key={item.id} className="rounded-md border border-[var(--border)] p-3">
              <div className="font-medium">{item.email}</div>
              <div className="mt-1 text-[var(--muted-foreground)]">
                {item.status} · downloads {item.downloadCount} · {item.createdAt.toISOString().slice(0, 10)}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="font-bold">Custom Excel requests (paid buyers)</h2>
        <div className="mt-4 grid gap-3 text-sm">
          {requests.length === 0 ? <p className="text-[var(--muted-foreground)]">None yet.</p> : null}
          {requests.map((item) => (
            <div key={item.id} className="rounded-md border border-[var(--border)] p-3">
              <div className="font-medium">{item.email}</div>
              <p className="mt-2 leading-6">{item.request}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
