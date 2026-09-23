import { cn } from "@/lib/utils";

export function DemoBadge({ className, label = "DEMO" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent",
        className,
      )}
    >
      {label}
    </span>
  );
}
