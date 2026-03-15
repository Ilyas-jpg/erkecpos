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
      className="relative bg-bg-card border border-accent-purple/25 rounded-[14px] p-4 text-left min-h-[120px] flex flex-col justify-between hover:border-accent-purple/40 hover:bg-bg-hover transition-all overflow-hidden"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Package className="w-[16px] h-[16px] text-accent-purple shrink-0" />
          <h3 className="font-semibold text-[15px] truncate tracking-[-0.2px]">{combo.name}</h3>
        </div>
        {combo.description && (
          <p className="text-text-muted text-[13px] line-clamp-2 leading-[1.35]">{combo.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {combo.items?.map((item) => (
            <span key={item.id} className="text-[11px] bg-fill-quaternary rounded-[6px] px-2 py-[2px] text-text-secondary truncate max-w-[120px]">
              {item.productName}
              {item.isSwappable ? " ↔" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        {individualTotal > 0 && (
          <span className="font-mono text-[13px] text-text-muted line-through shrink-0">
            {formatPrice(individualTotal)}
          </span>
        )}
        <div className="text-right ml-auto">
          <span className="font-mono text-[17px] font-bold text-accent-purple">{formatPrice(combo.price)}</span>
          {savings > 0 && (
            <div className="text-[11px] text-accent-green font-semibold">
              {formatPrice(savings)} tasarruf
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
