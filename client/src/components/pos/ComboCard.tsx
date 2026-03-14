import { motion } from "framer-motion";
import { formatPrice } from "../../lib/utils";
import type { Combo } from "../../lib/store";

interface ComboCardProps {
  combo: Combo;
  onTap: () => void;
}

export function ComboCard({ combo, onTap }: ComboCardProps) {
  const individualTotal = combo.individualTotal || 0;
  const savings = individualTotal - combo.price;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      className="relative bg-gradient-to-br from-accent-purple/8 to-bg-card border border-accent-purple/20 p-4 text-left min-h-[130px] flex flex-col justify-between hover:border-accent-purple/40 transition-all"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">📦</span>
          <h3 className="font-semibold text-sm">{combo.name}</h3>
        </div>
        <p className="text-text-muted text-xs">{combo.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {combo.items?.map((item) => (
            <span key={item.id} className="text-[9px] bg-bg-surface px-1.5 py-0.5 text-text-secondary tracking-wider">
              {item.productName}
              {item.isSwappable ? " ↔" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between">
        <div>
          {individualTotal > 0 && (
            <span className="font-mono text-xs text-text-muted line-through mr-2">
              {formatPrice(individualTotal)}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="font-mono text-base font-bold text-accent-purple">{formatPrice(combo.price)}</span>
          {savings > 0 && (
            <div className="text-[9px] text-accent-green font-semibold tracking-wider">
              {formatPrice(savings)} tasarruf
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
