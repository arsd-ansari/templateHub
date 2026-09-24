import Link from "next/link";
import { Download } from "lucide-react";
import { SheetPreview } from "@/components/templates/sheet-preview";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { categoryTint } from "@/lib/category-tint";
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
  const tint = categoryTint(template.category?.slug);

  return (
    <Card
      className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderLeftColor: tint, borderLeftWidth: 4 }}
    >
      <CardHeader>
        <SheetPreview label={`${template.title}.xlsx`} tint={tint} compact />
        <div className="pt-2">
          {template.category ? <Badge>{template.category.name}</Badge> : null}
        </div>
        <Link href={`/templates/${template.slug}`} className="font-heading block text-lg font-bold hover:text-[var(--primary)]">
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
