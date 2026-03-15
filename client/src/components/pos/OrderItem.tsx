import { motion } from "framer-motion";
import { formatPrice } from "../../lib/utils";
import type { CartItem } from "../../lib/store";
import { Trash2, Minus, Plus } from "lucide-react";

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
      className="bg-bg-tertiary rounded-[12px] p-3.5"
    >
      {/* Name + Price row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[15px] truncate tracking-[-0.2px]">{item.name}</h4>
          {item.extras.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.extras.map((ext, i) => (
                <span key={i} className="text-[11px] bg-fill-quaternary rounded-[6px] px-2 py-[2px] text-text-secondary">
                  {ext.name}
                </span>
              ))}
            </div>
          )}
          {item.note && (
            <p className="text-[12px] text-accent-orange mt-1.5 italic">{item.note}</p>
          )}
        </div>
        <span className="font-mono text-[15px] font-semibold text-accent-green shrink-0 tabular-nums">
          {formatPrice(item.total_price)}
        </span>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1">
          <button
            onClick={item.quantity === 1 ? onRemove : onDecrement}
            className="w-[36px] h-[36px] rounded-[10px] bg-fill-tertiary flex items-center justify-center active:bg-fill-secondary transition-colors"
          >
            {item.quantity === 1 ? <Trash2 className="w-[15px] h-[15px] text-accent-red" /> : <Minus className="w-[15px] h-[15px] text-text-secondary" />}
          </button>
          <span className="w-10 text-center font-mono font-bold text-[15px] tabular-nums">{item.quantity}</span>
          <button
            onClick={onIncrement}
            className="w-[36px] h-[36px] rounded-[10px] bg-fill-tertiary flex items-center justify-center text-accent-green active:bg-accent-green/15 transition-colors"
          >
            <Plus className="w-[15px] h-[15px]" />
          </button>
        </div>
        <span className="text-[13px] text-text-muted font-mono tabular-nums">
          {formatPrice(item.unit_price)} × {item.quantity}
        </span>
      </div>
    </motion.div>
  );
}
