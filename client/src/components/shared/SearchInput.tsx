import { cn } from "../../lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Ara...", className }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
        &#128269;
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm
          text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue
          min-h-[48px]"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      )}
    </div>
  );
}
