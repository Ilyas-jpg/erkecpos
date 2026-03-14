import { useStore } from "../../lib/store";

export function TopBar({ title }: { title?: string }) {
  const settings = useStore((s) => s.settings);
  const businessName = settings?.business_info?.name || "Dinlenme Tesisi";

  return (
    <header className="h-[52px] vibrancy-bar border-b border-separator flex items-center justify-between px-5 shrink-0">
      <h1 className="text-[17px] font-semibold tracking-[-0.4px]">{title || businessName}</h1>
      <span className="text-[13px] text-text-muted font-mono tabular-nums">
        {new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })}
      </span>
    </header>
  );
}
