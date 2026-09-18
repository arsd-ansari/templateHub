import type { Metadata } from "next";
import Link from "next/link";
import { SearchFilters } from "@/components/templates/search-filters";
import { TemplateCard } from "@/components/templates/template-card";
import { Button } from "@/components/ui/button";
import { getTemplateCategories, getTemplates } from "@/services/template-service";
import type { SortOption } from "@/types";

export const metadata: Metadata = {
  title: "Free Excel Templates",
  description:
    "Free GST invoice, RCM self invoice, cash book, P&L, expense, payroll, and budget spreadsheets for Excel and Google Sheets — unlocked files with written guides."
};

export const revalidate = 1800;

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const [categories, templates] = await Promise.all([
    getTemplateCategories(),
    getTemplates({
      query: params.q || "",
      category: params.category,
      sort: (params.sort as SortOption) || "latest",
      page
    })
  ]);
  const liveCategories = categories.filter((category) => category._count.templates > 0);
  const totalPages = Math.max(1, Math.ceil(templates.total / templates.pageSize));

  return (
    <div className="container py-10">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold">Free Excel Templates</h1>
        <p className="mt-3 leading-8 text-[var(--muted-foreground)]">
          Download unlocked .xlsx files for GST tax invoices, Reverse Charge self invoices, cash books, profit and loss, expenses, salary slips, rent receipts, and budgets. Each file is built for one job, checked in Excel, Google Sheets, and LibreOffice, and published with a written guide — not a blank grid.
        </p>
        <p className="mt-3 leading-8 text-[var(--muted-foreground)]">
          Commercial use is allowed. You do not need an account. If a formula is wrong, use the contact page and name the template URL. How files are reviewed before they go live is on the{" "}
          <Link href="/how-we-build" className="text-[var(--primary)] underline-offset-4 hover:underline">publishing checklist</Link>.
        </p>
      </div>
      <SearchFilters categories={liveCategories} />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.items.map((template) => <TemplateCard key={template.slug} template={template} />)}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <Button asChild variant="outline" aria-disabled={page <= 1}>
          <Link href={`/templates?page=${Math.max(1, page - 1)}`}>Previous</Link>
        </Button>
        <span className="text-sm text-[var(--muted-foreground)]">Page {page} of {totalPages}</span>
        <Button asChild variant="outline" aria-disabled={page >= totalPages}>
          <Link href={`/templates?page=${Math.min(totalPages, page + 1)}`}>Next</Link>
        </Button>
      </div>
    </div>
  );
}
