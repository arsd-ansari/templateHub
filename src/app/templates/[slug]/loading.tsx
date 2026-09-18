export default function TemplateDetailLoading() {
  return (
    <div className="container py-10">
      <div className="mb-5 h-4 w-48 animate-pulse rounded bg-[var(--muted)]" />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="h-5 w-28 animate-pulse rounded bg-[var(--muted)]" />
          <div className="mt-4 h-10 max-w-xl animate-pulse rounded bg-[var(--muted)]" />
          <div className="mt-4 h-20 max-w-3xl animate-pulse rounded bg-[var(--muted)]" />
          <div className="mt-6 h-11 w-56 animate-pulse rounded bg-[var(--muted)]" />
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-[var(--muted)]" />
      </div>
    </div>
  );
}
