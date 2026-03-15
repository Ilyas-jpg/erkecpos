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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-[16px] h-[16px]" strokeWidth={2} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-fill-tertiary rounded-[10px] pl-10 pr-10 py-2 text-[17px]
          text-text-primary placeholder:text-text-muted h-[36px] transition-all border-0
          focus:bg-fill-secondary"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-fill-secondary flex items-center justify-center text-text-muted"
        >
          <X className="w-[10px] h-[10px]" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
