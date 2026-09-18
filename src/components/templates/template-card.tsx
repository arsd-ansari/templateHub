import Link from "next/link";
import { Download, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

type TemplateCardProps = {
  template: {
    title: string;
    slug: string;
    description: string;
    downloadCount: number;
    category?: { name: string; slug: string } | null;
  };
};

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--muted)] text-[var(--primary)]">
            <FileSpreadsheet size={22} />
          </span>
          {template.category ? <Badge>{template.category.name}</Badge> : null}
        </div>
        <Link href={`/templates/${template.slug}`} className="block text-lg font-bold hover:text-[var(--primary)]">
          {template.title}
        </Link>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm leading-6 text-[var(--muted-foreground)]">{template.description}</p>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
            <Download size={15} /> {formatNumber(template.downloadCount)}
          </span>
          <Link className="font-semibold text-[var(--primary)]" href={`/templates/${template.slug}`}>
            View template
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
