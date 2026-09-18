import { CategoryAdminForm } from "@/components/admin/admin-form";
import { Card } from "@/components/ui/card";
import { getTemplateCategories } from "@/services/template-service";

export default async function AdminCategoriesPage() {
  const categories = await getTemplateCategories();
  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <CategoryAdminForm />
      <Card className="p-5">
        <h2 className="font-bold">Template categories</h2>
        <div className="mt-4 grid gap-2">
          {categories.map((category) => (
            <div key={category.slug} className="rounded-md border border-[var(--border)] p-3 text-sm">
              <strong>{category.name}</strong>
              <p className="mt-1 text-[var(--muted-foreground)]">{category.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
