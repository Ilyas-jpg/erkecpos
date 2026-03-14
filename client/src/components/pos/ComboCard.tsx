import { motion } from "framer-motion";
import { formatPrice } from "../../lib/utils";
import type { Combo } from "../../lib/store";
import { Package } from "lucide-react";

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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.96 }}
      onClick={onTap}
      className="relative bg-gradient-to-br from-accent-purple/10 to-bg-card border border-accent-purple/20 rounded-2xl p-4 text-left min-h-[130px] flex flex-col justify-between hover:border-accent-purple/40 hover:shadow-lg hover:shadow-accent-purple/5 transition-all"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-4 h-4 text-accent-purple" />
          <h3 className="font-semibold text-[14px]">{combo.name}</h3>
        </div>
        <p className="text-text-muted text-[12px]">{combo.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {combo.items?.map((item) => (
            <span key={item.id} className="text-[10px] bg-bg-surface rounded-md px-1.5 py-0.5 text-text-secondary">
              {item.productName}
              {item.isSwappable ? " \u2194" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between">
        {individualTotal > 0 && (
          <span className="font-mono text-[12px] text-text-muted line-through">
            {formatPrice(individualTotal)}
          </span>
        )}
        <div className="text-right ml-auto">
          <span className="font-mono text-[16px] font-bold text-accent-purple">{formatPrice(combo.price)}</span>
          {savings > 0 && (
            <div className="text-[10px] text-accent-green font-semibold">
              {formatPrice(savings)} tasarruf
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
