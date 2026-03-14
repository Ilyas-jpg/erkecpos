import { useStore } from "../../lib/store";

export function TopBar({ title }: { title?: string }) {
  const settings = useStore((s) => s.settings);
  const businessName = settings?.business_info?.name || "Dinlenme Tesisi";

  return (
    <header className="h-14 bg-bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-5 shrink-0">
      <h1 className="text-sm font-semibold tracking-widest uppercase text-text-primary">{title || businessName}</h1>
      <div className="flex items-center gap-3 text-xs text-text-muted font-mono tracking-wider">
        {new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
      </div>
    </header>
  );
}
