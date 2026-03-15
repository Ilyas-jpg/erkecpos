import { useState } from "react";
import { Modal } from "../shared/Modal";
import { Button } from "../shared/Button";
import { cn, formatPrice } from "../../lib/utils";
import { useStore, type Combo } from "../../lib/store";

interface ComboSwapModalProps {
  open: boolean;
  onClose: () => void;
  combo: Combo | null;
}

export function ComboSwapModal({ open, onClose, combo }: ComboSwapModalProps) {
  const products = useStore((s) => s.products);
  const addToCart = useStore((s) => s.addToCart);
  const addToast = useStore((s) => s.addToast);

  const [swaps, setSwaps] = useState<Record<string, string>>({});

  if (!combo) return null;

  const handleSwap = (itemId: string, newProductId: string) => {
    setSwaps((prev) => ({ ...prev, [itemId]: newProductId }));
  };

  const handleAdd = () => {
    let priceDiff = 0;
    for (const item of combo.items) {
      if (swaps[item.id]) {
        const original = products.find((p) => p.id === item.productId);
        const swapped = products.find((p) => p.id === swaps[item.id]);
        if (original && swapped) {
          priceDiff += (swapped.price - original.price);
        }
      }
    }

    const finalPrice = combo.price + priceDiff;

    addToCart({
      combo_id: combo.id,
      name: combo.name,
      quantity: 1,
      unit_price: finalPrice,
      total_price: finalPrice,
      extras: [],
    });
    addToast(`${combo.name} sepete eklendi`);
    setSwaps({});
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={combo.name} size="md">
      <div className="p-5">
        {combo.description && (
          <p className="text-text-secondary text-[15px] leading-relaxed mb-5">{combo.description}</p>
        )}

        <div className="space-y-4 mb-6">
          {combo.items.map((item) => {
            const swappable = item.isSwappable === 1;
            const swappedId = swaps[item.id];
            const currentProduct = swappedId
              ? products.find((p) => p.id === swappedId)
              : products.find((p) => p.id === item.productId);

            const swapOptions = swappable && item.swapCategoryId
              ? products.filter((p) => p.categoryId === item.swapCategoryId && p.active === 1)
              : [];

            return (
              <div key={item.id} className="bg-bg-tertiary rounded-[12px] p-4">
                <div className="flex justify-between items-center gap-3 mb-2">
                  <span className="font-semibold text-[15px] truncate">
                    {currentProduct?.name || item.productName}
                    {item.quantity > 1 && ` x${item.quantity}`}
                  </span>
                  {swappable && (
                    <span className="text-[11px] bg-accent-amber/15 text-accent-amber rounded-[8px] px-2.5 py-1 font-medium shrink-0">
                      Değiştirilebilir
                    </span>
                  )}
                </div>

                {swappable && swapOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {swapOptions.map((opt) => {
                      const isSelected = (swappedId || item.productId) === opt.id;
                      const priceDiff = opt.price - item.productPrice;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSwap(item.id, opt.id)}
                          className={cn(
                            "px-3.5 py-2.5 text-[13px] border rounded-[10px] min-h-[44px] transition-all",
                            isSelected
                              ? "border-accent-green bg-accent-green/10 text-accent-green font-medium"
                              : "border-border text-text-secondary hover:bg-bg-hover"
                          )}
                        >
                          <span>{opt.name}</span>
                          {priceDiff !== 0 && (
                            <span className="font-mono ml-1.5 text-[12px]">
                              {priceDiff > 0 ? "+" : ""}{formatPrice(priceDiff)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button size="xl" variant="success" className="w-full" onClick={handleAdd}>
          Sepete Ekle — {formatPrice(combo.price)}
        </Button>
      </div>
    </Modal>
  );
}
