import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
}

const variants = {
  primary: "bg-accent-blue hover:brightness-110 text-white",
  secondary: "bg-fill-tertiary hover:bg-fill-secondary text-text-primary",
  danger: "bg-accent-red hover:brightness-110 text-white",
  success: "bg-accent-green hover:brightness-110 text-white",
  ghost: "bg-transparent text-accent-blue hover:bg-fill-quaternary",
};

const sizes = {
  sm: "px-4 py-2 text-[13px] min-h-[32px] rounded-[8px]",
  md: "px-5 py-2.5 text-[15px] min-h-[44px] rounded-[10px]",
  lg: "px-6 py-3 text-[15px] min-h-[48px] rounded-[12px]",
  xl: "px-6 py-3.5 text-[17px] min-h-[50px] rounded-[14px]",
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2",
        "whitespace-nowrap overflow-hidden text-ellipsis",
        "active:scale-[0.97] active:opacity-90",
        "disabled:opacity-30 disabled:pointer-events-none",
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
