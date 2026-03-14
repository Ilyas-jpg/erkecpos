import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
}

const variants = {
  primary: "bg-accent-red hover:bg-red-600 text-white",
  secondary: "bg-bg-surface hover:bg-bg-hover text-text-primary border border-border",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  success: "bg-accent-green hover:bg-emerald-600 text-white",
  ghost: "bg-transparent hover:bg-bg-surface text-text-secondary",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm min-h-[36px]",
  md: "px-4 py-2 text-sm min-h-[44px]",
  lg: "px-6 py-3 text-base min-h-[48px]",
  xl: "px-8 py-4 text-lg min-h-[64px] font-semibold",
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl font-medium transition-all duration-150 flex items-center justify-center gap-2",
        "active:scale-[0.96] active:opacity-90 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
