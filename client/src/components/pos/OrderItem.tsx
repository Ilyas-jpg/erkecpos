import { motion } from "framer-motion";
import { formatPrice } from "../../lib/utils";
import type { CartItem } from "../../lib/store";

interface OrderItemProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function OrderItem({ item, onIncrement, onDecrement, onRemove }: OrderItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-bg-surface rounded-xl p-3 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{item.name}</h4>
          {item.extras.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.extras.map((ext, i) => (
                <span key={i} className="text-[10px] bg-bg-card px-1.5 py-0.5 rounded text-text-muted">
                  {ext.name}
                </span>
              ))}
            </div>
          )}
          {item.note && (
            <p className="text-[10px] text-accent-amber mt-1 italic">{item.note}</p>
          )}
        </div>
        <span className="font-mono text-sm font-semibold text-accent-green shrink-0">
          {formatPrice(item.total_price)}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={item.quantity === 1 ? onRemove : onDecrement}
            className="w-10 h-10 rounded-lg bg-bg-card border border-border flex items-center justify-center
              text-lg font-bold text-text-secondary hover:bg-bg-hover active:scale-95 transition-all"
          >
            {item.quantity === 1 ? "🗑" : "−"}
          </button>
          <span className="w-10 text-center font-mono font-bold text-sm">{item.quantity}</span>
          <button
            onClick={onIncrement}
            className="w-10 h-10 rounded-lg bg-bg-card border border-border flex items-center justify-center
              text-lg font-bold text-accent-green hover:bg-accent-green/10 active:scale-95 transition-all"
          >
            +
          </button>
        </div>
        <span className="text-xs text-text-muted font-mono">
          {formatPrice(item.unit_price)} x {item.quantity}
        </span>
      </div>
    </motion.div>
  );
}
