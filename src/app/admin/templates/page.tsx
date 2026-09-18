import { TemplateAdminForm } from "@/components/admin/admin-form";
import { Card } from "@/components/ui/card";
import { getTemplateCategories, getTemplates } from "@/services/template-service";

export default async function AdminTemplatesPage() {
  const [categories, templates] = await Promise.all([getTemplateCategories(), getTemplates({ pageSize: 20 })]);
  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <TemplateAdminForm categories={categories} />
      <Card className="p-5">
        <h2 className="font-bold">Templates</h2>
        <div className="mt-4 grid gap-2">
          {templates.items.map((template) => (
            <div key={template.slug} className="flex justify-between rounded-md border border-[var(--border)] p-3 text-sm">
              <span>{template.title}</span>
              <span>{template.downloadCount}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
