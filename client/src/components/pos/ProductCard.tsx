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
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      className={cn(
        "relative bg-bg-card border p-4 text-left transition-all",
        "hover:bg-bg-surface",
        "flex flex-col justify-between min-h-[130px]",
        cartQuantity > 0
          ? "border-accent-green/50 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.15)]"
          : "border-border"
      )}
      style={cartQuantity > 0 ? {} : { borderLeftColor: categoryColor || undefined, borderLeftWidth: categoryColor ? "3px" : undefined }}
    >
      {cartQuantity > 0 && (
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-green text-white text-[10px] font-bold flex items-center justify-center shadow-md">
          {cartQuantity}
        </span>
      )}

      {hasExtras && (
        <span className="absolute top-2 right-2 text-[9px] font-bold bg-accent-purple/15 text-accent-purple px-1.5 py-0.5 tracking-wider uppercase">
          +Ekstra
        </span>
      )}

      <div>
        <h3 className="font-semibold text-sm leading-tight mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-text-muted text-xs line-clamp-2">{product.description}</p>
        )}
      </div>

      <div className="mt-2">
        <span className="font-mono text-base font-bold text-accent-green">
          {formatPrice(product.price)}
        </span>
      </div>
    </motion.button>
  );
}
