import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
}

const variants = {
  primary: "bg-accent-blue hover:bg-blue-500 text-white shadow-sm",
  secondary: "bg-bg-surface hover:bg-bg-hover text-text-primary",
  danger: "bg-accent-red hover:bg-red-500 text-white shadow-sm",
  success: "bg-accent-green hover:bg-green-400 text-white shadow-sm",
  ghost: "bg-transparent hover:bg-bg-surface text-text-secondary",
};

const sizes = {
  sm: "px-3 py-1.5 text-[13px] min-h-[32px] rounded-lg",
  md: "px-4 py-2 text-[15px] min-h-[44px] rounded-xl",
  lg: "px-5 py-2.5 text-[15px] min-h-[48px] rounded-xl",
  xl: "px-6 py-3.5 text-[17px] min-h-[56px] rounded-2xl",
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-semibold transition-all duration-200 flex items-center justify-center gap-2",
        "active:scale-[0.97] active:opacity-80 disabled:opacity-40 disabled:pointer-events-none",
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
