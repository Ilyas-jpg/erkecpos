import { motion } from "framer-motion";
import { cn, formatPrice } from "../../lib/utils";
import type { Product } from "../../lib/store";
import { Sparkles } from "lucide-react";

interface ProductCardProps {
  product: Product;
  categoryColor?: string | null;
  cartQuantity: number;
  hasExtras: boolean;
  onTap: () => void;
}

export function ProductCard({ product, categoryColor, cartQuantity, hasExtras, onTap }: ProductCardProps) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={onTap}
      className={cn(
        "relative rounded-[14px] p-4 text-left transition-all duration-200",
        "flex flex-col justify-between min-h-[110px]",
        "bg-bg-card border border-border",
        "hover:bg-bg-hover",
        "active:bg-bg-surface",
        cartQuantity > 0 && "border-accent-green/40 bg-accent-green/[0.04]"
      )}
      style={cartQuantity > 0 ? {} : { borderLeftWidth: categoryColor ? '3px' : undefined, borderLeftColor: categoryColor || undefined }}
    >
      {/* Cart quantity badge */}
      {cartQuantity > 0 && (
        <span className="absolute -top-[6px] -right-[6px] min-w-[22px] h-[22px] bg-accent-green text-white text-[12px] font-bold rounded-full flex items-center justify-center px-1 shadow-[0_2px_8px_rgba(48,209,88,0.4)]">
          {cartQuantity}
        </span>
      )}

      {/* Extras badge */}
      {hasExtras && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-medium bg-accent-purple/12 text-accent-purple px-2 py-[3px] rounded-[8px]">
          <Sparkles className="w-3 h-3" />
          Ekstra
        </span>
      )}

      {/* Product info */}
      <div className="pr-2">
        <h3 className="font-semibold text-[15px] leading-tight text-text-primary tracking-[-0.2px]">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-text-muted text-[13px] line-clamp-2 mt-1 leading-[1.35]">
            {product.description}
          </p>
        )}
      </div>

      {/* Price */}
      <span className="font-mono text-[15px] font-bold text-accent-green mt-3 tabular-nums tracking-[-0.3px]">
        {formatPrice(product.price)}
      </span>
    </motion.button>
  );
}
