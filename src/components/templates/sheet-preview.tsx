import { cn } from "@/lib/utils";

type SheetPreviewProps = {
  label: string;
  tint: string;
  compact?: boolean;
};

export function SheetPreview({ label, tint, compact = false }: SheetPreviewProps) {
  const rows = compact ? 3 : 5;
  const cols = 4;

  return (
    <div className="overflow-hidden rounded-md border border-[var(--border)]">
      <div
        className="truncate px-2 py-1.5 text-[11px] font-semibold tracking-wide text-white"
        style={{ background: tint }}
      >
        {label}
      </div>
      <div className="grid grid-cols-4 gap-px bg-[var(--border)] p-px">
        {Array.from({ length: rows * cols }, (_, index) => (
          <div
            key={index}
            className={cn("bg-[var(--card)]", compact ? "h-2" : "h-4")}
            style={index < cols ? { background: `color-mix(in srgb, ${tint} 22%, var(--card))` } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
