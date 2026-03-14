import { motion } from "framer-motion";
import { cn, formatPrice } from "../../lib/utils";
import { useStore, type Product } from "../../lib/store";

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileTap={{ scale: 0.96 }}
      onClick={onTap}
      className={cn(
        "relative bg-bg-card border rounded-2xl p-4 text-left transition-all",
        "hover:bg-bg-surface active:bg-bg-hover",
        "flex flex-col justify-between min-h-[140px]",
        cartQuantity > 0
          ? "border-accent-green shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
          : "border-border"
      )}
      style={cartQuantity > 0 ? {} : { borderLeftColor: categoryColor || undefined, borderLeftWidth: "3px" }}
    >
      {cartQuantity > 0 && (
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-accent-green text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
          {cartQuantity}
        </span>
      )}

      {hasExtras && (
        <span className="absolute top-2 right-2 text-[10px] bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded">
          +EKSTRA
        </span>
      )}

      <div>
        <h3 className="font-semibold text-sm leading-tight mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-text-muted text-xs line-clamp-2">{product.description}</p>
        )}
      </div>

      <div className="mt-2">
        <span className="font-mono text-lg font-bold text-accent-green">
          {formatPrice(product.price)}
        </span>
      </div>
    </motion.button>
  );
}
