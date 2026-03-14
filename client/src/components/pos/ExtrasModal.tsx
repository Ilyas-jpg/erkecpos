import { useState, useMemo } from "react";
import { Modal } from "../shared/Modal";
import { Button } from "../shared/Button";
import { cn, formatPrice } from "../../lib/utils";
import { useStore, type Product, type Extra, type OrderItemExtra } from "../../lib/store";
import { api } from "../../lib/api";

interface ExtrasModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ExtrasModal({ open, onClose, product }: ExtrasModalProps) {
  const extras = useStore((s) => s.extras);
  const addToCart = useStore((s) => s.addToCart);
  const addToast = useStore((s) => s.addToast);

  const [selectedPorsiyon, setSelectedPorsiyon] = useState<string | null>(null);
  const [selectedSoslar, setSelectedSoslar] = useState<Set<string>>(new Set());
  const [selectedMalzeme, setSelectedMalzeme] = useState<Set<string>>(new Set());
  const [productExtras, setProductExtras] = useState<Extra[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load product extras when opening
  useMemo(() => {
    if (open && product && !loaded) {
      api.get<any>(`/api/products/${product.id}`).then((data) => {
        setProductExtras(data.extras || []);
        setLoaded(true);
      }).catch(() => setLoaded(true));
    }
    if (!open) {
      setSelectedPorsiyon(null);
      setSelectedSoslar(new Set());
      setSelectedMalzeme(new Set());
      setLoaded(false);
      setProductExtras([]);
    }
  }, [open, product]);

  if (!product) return null;

  const porsiyonExtras = productExtras.filter((e) => e.type === "porsiyon");
  const sosExtras = productExtras.filter((e) => e.type === "sos");
  const malzemeExtras = productExtras.filter((e) => e.type === "malzeme");

  const selectedExtras: OrderItemExtra[] = [];
  let extraTotal = 0;

  if (selectedPorsiyon) {
    const p = porsiyonExtras.find((e) => e.id === selectedPorsiyon);
    if (p) {
      selectedExtras.push({ extra_id: p.id, name: p.name, type: "porsiyon", price: p.price });
      extraTotal += p.price;
    }
  }
  for (const id of selectedSoslar) {
    const s = sosExtras.find((e) => e.id === id);
    if (s) {
      selectedExtras.push({ extra_id: s.id, name: s.name, type: "sos", price: s.price });
      extraTotal += s.price;
    }
  }
  for (const id of selectedMalzeme) {
    const m = malzemeExtras.find((e) => e.id === id);
    if (m) {
      selectedExtras.push({ extra_id: m.id, name: m.name, type: "malzeme", price: m.price });
      extraTotal += m.price;
    }
  }

  const totalPrice = product.price + extraTotal;

  const handleAdd = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      quantity: 1,
      unit_price: totalPrice,
      total_price: totalPrice,
      extras: selectedExtras,
    });
    addToast(`${product.name} sepete eklendi`);
    onClose();
  };

  const toggleSet = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  return (
    <Modal open={open} onClose={onClose} title={product.name} size="md">
      <div className="p-5">
        {/* Product info */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-border">
          <div>
            <p className="text-text-secondary text-sm">{product.description}</p>
          </div>
          <span className="font-mono text-xl font-bold text-accent-green">{formatPrice(product.price)}</span>
        </div>

        {/* Porsiyon */}
        {porsiyonExtras.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Porsiyon</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedPorsiyon(null)}
                className={cn(
                  "p-3 border rounded-xl text-center min-h-[56px] transition-all",
                  !selectedPorsiyon
                    ? "border-accent-green bg-accent-green/10 text-accent-green"
                    : "border-border bg-bg-surface text-text-primary hover:bg-bg-hover"
                )}
              >
                <div className="font-medium text-sm">Normal</div>
              </button>
              {porsiyonExtras.map((ext) => (
                <button
                  key={ext.id}
                  onClick={() => setSelectedPorsiyon(ext.id === selectedPorsiyon ? null : ext.id)}
                  className={cn(
                    "p-3 border rounded-xl text-center min-h-[56px] transition-all",
                    selectedPorsiyon === ext.id
                      ? "border-accent-green bg-accent-green/10 text-accent-green"
                      : "border-border bg-bg-surface text-text-primary hover:bg-bg-hover"
                  )}
                >
                  <div className="font-medium text-sm">{ext.name}</div>
                  <div className="font-mono text-xs mt-0.5">
                    {ext.price > 0 ? `+${formatPrice(ext.price)}` : formatPrice(ext.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Soslar */}
        {sosExtras.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Sos</h3>
            <div className="flex flex-wrap gap-2">
              {sosExtras.map((ext) => (
                <button
                  key={ext.id}
                  onClick={() => toggleSet(selectedSoslar, ext.id, setSelectedSoslar)}
                  className={cn(
                    "px-4 py-2.5 border rounded-xl text-sm min-h-[48px] transition-all",
                    selectedSoslar.has(ext.id)
                      ? "border-accent-amber bg-accent-amber/10 text-accent-amber"
                      : "border-border bg-bg-surface text-text-primary hover:bg-bg-hover"
                  )}
                >
                  {ext.name}
                  {ext.price > 0 && <span className="font-mono text-xs ml-1">+{formatPrice(ext.price)}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Malzeme */}
        {malzemeExtras.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Ek Malzeme</h3>
            <div className="flex flex-wrap gap-2">
              {malzemeExtras.map((ext) => (
                <button
                  key={ext.id}
                  onClick={() => toggleSet(selectedMalzeme, ext.id, setSelectedMalzeme)}
                  className={cn(
                    "px-4 py-2.5 border rounded-xl text-sm min-h-[48px] transition-all",
                    selectedMalzeme.has(ext.id)
                      ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                      : "border-border bg-bg-surface text-text-primary hover:bg-bg-hover"
                  )}
                >
                  {ext.name}
                  {ext.price > 0 && <span className="font-mono text-xs ml-1">+{formatPrice(ext.price)}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Total & Add */}
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-text-secondary">Toplam</span>
            <span className="font-mono text-2xl font-bold text-accent-green">{formatPrice(totalPrice)}</span>
          </div>
          <Button size="xl" variant="success" className="w-full" onClick={handleAdd}>
            Sepete Ekle
          </Button>
        </div>
      </div>
    </Modal>
  );
}
