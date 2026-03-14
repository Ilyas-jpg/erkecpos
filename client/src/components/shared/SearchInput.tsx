import { cn } from "../../lib/utils";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Ara...", className }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-surface rounded-xl pl-10 pr-10 py-3 text-[15px]
          text-text-primary placeholder:text-text-muted min-h-[44px] transition-all border border-transparent"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary w-5 h-5 rounded-full bg-bg-hover flex items-center justify-center"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
