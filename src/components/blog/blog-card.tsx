import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type BlogCardProps = {
  post: {
    title: string;
    slug: string;
    excerpt: string;
    createdAt: Date;
    category?: { name: string; slug: string } | null;
  };
};

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        {post.category ? <Badge>{post.category.name}</Badge> : null}
        <Link href={`/blog/${post.slug}`} className="block text-lg font-bold hover:text-[var(--primary)]">
          {post.title}
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{post.excerpt}</p>
        <div className="mt-5 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <CalendarDays size={14} />
          {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(post.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
}
