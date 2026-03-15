import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color = "bg-fill-quaternary text-text-secondary", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-[8px] text-[12px] font-medium whitespace-nowrap", color, className)}>
      {children}
    </span>
  );
}
