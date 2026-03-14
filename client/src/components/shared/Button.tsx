import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
}

const variants = {
  primary: "bg-accent-blue/90 hover:bg-accent-blue text-white shadow-[0_2px_8px_rgba(74,158,255,0.2)]",
  secondary: "bg-white/[0.06] hover:bg-white/[0.1] text-white/80",
  danger: "bg-accent-red/85 hover:bg-accent-red text-white shadow-[0_2px_8px_rgba(232,83,75,0.2)]",
  success: "bg-accent-green/85 hover:bg-accent-green text-white shadow-[0_2px_8px_rgba(60,192,106,0.2)]",
  ghost: "bg-transparent text-accent-blue/90 hover:bg-white/[0.04]",
};

const sizes = {
  sm: "px-3.5 py-1.5 text-[13px] min-h-[30px] rounded-[9px]",
  md: "px-4 py-2.5 text-[14px] min-h-[40px] rounded-[10px]",
  lg: "px-5 py-3 text-[15px] min-h-[46px] rounded-[12px]",
  xl: "px-6 py-3.5 text-[16px] min-h-[50px] rounded-[13px]",
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-medium transition-all duration-200 flex items-center justify-center gap-2",
        "active:scale-[0.98] active:opacity-80 disabled:opacity-25 disabled:pointer-events-none",
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
