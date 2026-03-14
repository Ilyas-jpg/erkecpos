import { cn } from "../../lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer min-h-[48px]">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-12 h-7 rounded-full transition-colors duration-200",
          checked ? "bg-accent-green" : "bg-bg-surface border border-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-200 shadow",
            checked && "translate-x-5"
          )}
        />
      </button>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </label>
  );
}
