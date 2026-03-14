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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileTap={{ scale: 0.96 }}
      onClick={onTap}
      className={cn(
        "relative bg-bg-card border rounded-2xl p-4 text-left transition-all",
        "hover:bg-bg-surface hover:shadow-lg hover:shadow-black/10",
        "flex flex-col justify-between min-h-[130px]",
        cartQuantity > 0
          ? "border-accent-green/40 shadow-[0_0_12px_rgba(48,209,88,0.08)]"
          : "border-white/[0.06]"
      )}
      style={cartQuantity > 0 ? {} : { borderLeftColor: categoryColor || undefined, borderLeftWidth: categoryColor ? "3px" : undefined }}
    >
      {cartQuantity > 0 && (
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-green text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
          {cartQuantity}
        </span>
      )}

      {hasExtras && (
        <span className="absolute top-2.5 right-2.5 flex items-center gap-0.5 text-[10px] font-semibold bg-accent-purple/15 text-accent-purple px-1.5 py-0.5 rounded-md">
          <Sparkles className="w-3 h-3" />
          Ekstra
        </span>
      )}

      <div>
        <h3 className="font-semibold text-[14px] leading-tight mb-0.5">{product.name}</h3>
        {product.description && (
          <p className="text-text-muted text-[12px] line-clamp-2">{product.description}</p>
        )}
      </div>

      <span className="font-mono text-[16px] font-bold text-accent-green mt-2">
        {formatPrice(product.price)}
      </span>
    </motion.button>
  );
}
