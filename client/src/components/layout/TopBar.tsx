import { useStore } from "../../lib/store";

export function TopBar({ title }: { title?: string }) {
  const settings = useStore((s) => s.settings);
  const businessName = settings?.business_info?.name || "Dinlenme Tesisi";

  return (
    <header className="h-14 bg-bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold">{title || businessName}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="font-mono">
          {new Date().toLocaleDateString("tr-TR")}
        </span>
      </div>
    </header>
  );
}
