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
          "relative w-[51px] h-[31px] rounded-full transition-colors duration-300",
          checked ? "bg-accent-green" : "bg-bg-hover"
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] left-[2px] w-[27px] h-[27px] bg-white rounded-full transition-transform duration-300 shadow-sm",
            checked && "translate-x-5"
          )}
        />
      </button>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </label>
  );
}
