import { useStore } from "../../lib/store";

export function TopBar({ title }: { title?: string }) {
  const settings = useStore((s) => s.settings);
  const businessName = settings?.business_info?.name || "Dinlenme Tesisi";

  return (
    <header className="h-12 bg-bg-card/50 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-5 shrink-0">
      <h1 className="text-[17px] font-semibold">{title || businessName}</h1>
      <span className="text-[13px] text-text-secondary font-mono">
        {new Date().toLocaleDateString("tr-TR")}
      </span>
    </header>
  );
}
