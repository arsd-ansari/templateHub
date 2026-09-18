import { upsertBlogPost, upsertTemplate, upsertTemplateCategory } from "@/actions/template-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function TemplateAdminForm({ categories }: { categories: Array<{ id: string; name: string }> }) {
  return (
    <Card className="p-5">
      <h2 className="font-bold">Create or update template</h2>
      <form action={upsertTemplate} className="mt-4 grid gap-3">
        <Input name="title" placeholder="Title" required />
        <Input name="slug" placeholder="slug" required />
        <Input name="description" placeholder="Description" required />
        <textarea name="content" placeholder="Content" required className="min-h-28 rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-sm" />
        <select name="categoryId" required className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <label className="grid gap-2 text-sm font-medium">
          Template file
          <Input name="templateFile" type="file" accept=".xlsx,.xls,.csv" />
        </label>
        <Input name="fileUrl" placeholder="/uploads/templates/file.xlsx or external file URL" />
        <label className="grid gap-2 text-sm font-medium">
          Thumbnail image
          <Input name="thumbnailFile" type="file" accept="image/*" />
        </label>
        <Input name="thumbnailUrl" placeholder="/uploads/images/thumb.jpg" />
        <Input name="seoTitle" placeholder="SEO title" required />
        <Input name="seoDescription" placeholder="SEO description" required />
        <Input name="tags" placeholder="excel, finance, invoice" />
        <Button type="submit">Save Template</Button>
      </form>
    </Card>
  );
}

export function BlogAdminForm({ categories }: { categories: Array<{ id: string; name: string }> }) {
  return (
    <Card className="p-5">
      <h2 className="font-bold">Create or update blog post</h2>
      <form action={upsertBlogPost} className="mt-4 grid gap-3">
        <Input name="title" placeholder="Title" required />
        <Input name="slug" placeholder="slug" required />
        <Input name="excerpt" placeholder="Excerpt" required />
        <textarea name="content" placeholder="Markdown content" required className="min-h-44 rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-sm" />
        <select name="categoryId" required className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <Input name="featuredImage" placeholder="/uploads/images/image.jpg" />
        <Input name="seoTitle" placeholder="SEO title" required />
        <Input name="seoDescription" placeholder="SEO description" required />
        <Input name="tags" placeholder="excel, guide, accounting" />
        <Button type="submit">Save Blog Post</Button>
      </form>
    </Card>
  );
}

export function CategoryAdminForm() {
  return (
    <Card className="p-5">
      <h2 className="font-bold">Create or update template category</h2>
      <form action={upsertTemplateCategory} className="mt-4 grid gap-3">
        <Input name="name" placeholder="Name" required />
        <Input name="slug" placeholder="slug" required />
        <Input name="icon" placeholder="Lucide icon name" required />
        <Input name="description" placeholder="Description" required />
        <Button type="submit">Save Category</Button>
      </form>
    </Card>
  );
}
