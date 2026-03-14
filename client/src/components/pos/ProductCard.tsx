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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onTap}
      className={cn(
        "relative rounded-[16px] p-4 text-left transition-all duration-300",
        "flex flex-col justify-between min-h-[120px]",
        "bg-gradient-to-b from-white/[0.06] to-white/[0.02]",
        "shadow-[0_2px_8px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(255,255,255,0.04)_inset]",
        "hover:shadow-[0_4px_16px_rgba(0,0,0,0.18),0_0_0_0.5px_rgba(255,255,255,0.06)_inset]",
        "hover:from-white/[0.08] hover:to-white/[0.03]",
        cartQuantity > 0 && "ring-1 ring-accent-green/30 from-accent-green/[0.06] to-accent-green/[0.02]"
      )}
      style={cartQuantity > 0 ? {} : { borderLeft: categoryColor ? `2.5px solid ${categoryColor}` : undefined }}
    >
      {cartQuantity > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] bg-accent-green text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(60,192,106,0.35)]">
          {cartQuantity}
        </span>
      )}

      {hasExtras && (
        <span className="absolute top-2.5 right-2.5 flex items-center gap-0.5 text-[10px] font-medium bg-accent-purple/10 text-accent-purple/80 px-1.5 py-0.5 rounded-[6px]">
          <Sparkles className="w-2.5 h-2.5" />
          Ekstra
        </span>
      )}

      <div>
        <h3 className="font-semibold text-[14px] leading-snug text-white/90">{product.name}</h3>
        {product.description && (
          <p className="text-white/30 text-[12px] line-clamp-2 mt-1 leading-relaxed">{product.description}</p>
        )}
      </div>

      <span className="font-mono text-[15px] font-bold text-accent-green/90 mt-2 tabular-nums">
        {formatPrice(product.price)}
      </span>
    </motion.button>
  );
}
