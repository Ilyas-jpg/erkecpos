import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useStore, type Product, type Combo } from "../lib/store";
import { cn } from "../lib/utils";
import { ProductGrid } from "../components/pos/ProductGrid";
import { OrderPanel } from "../components/pos/OrderPanel";
import { ExtrasModal } from "../components/pos/ExtrasModal";
import { ComboSwapModal } from "../components/pos/ComboSwapModal";

export function POSPage() {
  const categories = useStore((s) => s.categories);
  const combos = useStore((s) => s.combos);
  const selectedCategory = useStore((s) => s.selectedCategory);
  const setSelectedCategory = useStore((s) => s.setSelectedCategory);
  const addToCart = useStore((s) => s.addToCart);
  const addToast = useStore((s) => s.addToast);

  const [search, setSearch] = useState("");
  const [extrasProduct, setExtrasProduct] = useState<Product | null>(null);
  const [comboModal, setComboModal] = useState<Combo | null>(null);
  const [showOrder, setShowOrder] = useState(false);

  const cart = useStore((s) => s.cart);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handleProductTap = (product: Product, hasExtras: boolean) => {
    if (hasExtras) {
      setExtrasProduct(product);
    } else {
      addToCart({
        product_id: product.id,
        name: product.name,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price,
        extras: [],
      });
      addToast(`${product.name} eklendi`);
    }
  };

  const handleComboTap = (comboId: string) => {
    const combo = combos.find((c) => c.id === comboId);
    if (combo) {
      const hasSwappable = combo.items?.some((i) => i.isSwappable === 1);
      if (hasSwappable) {
        setComboModal(combo);
      } else {
        addToCart({
          combo_id: combo.id,
          name: combo.name,
          quantity: 1,
          unit_price: combo.price,
          total_price: combo.price,
          extras: [],
        });
        addToast(`${combo.name} eklendi`);
      }
    }
  };

  return (
    <div className="flex h-full">
      {/* Category Sidebar — desktop only */}
      <aside className="hidden lg:flex flex-col w-[88px] bg-bg-secondary/50 border-r border-separator shrink-0">
        <div className="flex-1 overflow-y-auto scroll-container py-2 px-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "w-full min-h-[52px] py-2 px-1 flex flex-col items-center gap-[5px] text-center transition-all rounded-[12px] mb-1",
              !selectedCategory
                ? "bg-accent-blue/12 text-accent-blue"
                : "text-text-muted hover:bg-fill-quaternary hover:text-text-secondary"
            )}
          >
            <LayoutGrid className="w-[20px] h-[20px]" strokeWidth={1.7} />
            <span className="text-[11px] font-medium leading-none">Tümü</span>
          </button>
          {categories.filter((c) => c.active === 1).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "w-full min-h-[52px] py-2 px-1 flex flex-col items-center gap-[5px] text-center transition-all rounded-[12px] mb-1",
                selectedCategory === cat.id
                  ? "bg-accent-blue/12 text-accent-blue"
                  : "text-text-muted hover:bg-fill-quaternary hover:text-text-secondary"
              )}
            >
              <span className="text-[18px] leading-none">{cat.icon || "📋"}</span>
              <span className="text-[11px] font-medium leading-none">{cat.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Mobile category bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 vibrancy-bar border-b border-separator">
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scroll-container">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-4 py-[7px] text-[13px] font-semibold whitespace-nowrap transition-all rounded-full shrink-0",
              !selectedCategory
                ? "bg-accent-blue text-white"
                : "bg-fill-quaternary text-text-secondary"
            )}
          >
            Tümü
          </button>
          {categories.filter((c) => c.active === 1).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-[7px] text-[13px] font-semibold whitespace-nowrap transition-all rounded-full shrink-0",
                selectedCategory === cat.id
                  ? "bg-accent-blue text-white"
                  : "bg-fill-quaternary text-text-secondary"
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 flex flex-col min-h-0 lg:pt-0 pt-[52px] pb-[50px] lg:pb-0">
        <ProductGrid
          search={search}
          onSearchChange={setSearch}
          onProductTap={handleProductTap}
          onComboTap={handleComboTap}
        />
      </div>

      {/* Order Panel — desktop */}
      <div className="hidden lg:flex">
        <OrderPanel />
      </div>

      {/* Mobile cart button */}
      {cartCount > 0 && !showOrder && (
        <button
          onClick={() => setShowOrder(true)}
          className="lg:hidden fixed bottom-[58px] left-4 right-4 bg-accent-green text-white py-3.5
            font-semibold text-[15px] text-center z-30 rounded-[14px]
            shadow-[0_4px_20px_rgba(48,209,88,0.35)]
            active:scale-[0.97] transition-transform"
        >
          Sepeti Gör ({cartCount} ürün)
        </button>
      )}

      {/* Mobile order overlay */}
      {showOrder && (
        <div className="lg:hidden fixed inset-0 z-50 bg-bg-primary flex flex-col">
          <div className="flex items-center justify-between px-4 h-[56px] border-b border-separator shrink-0">
            <h2 className="font-semibold text-[17px]">Sipariş</h2>
            <button
              onClick={() => setShowOrder(false)}
              className="text-accent-blue font-medium text-[17px] min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              Kapat
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <OrderPanel />
          </div>
        </div>
      )}

      {/* Modals */}
      <ExtrasModal open={!!extrasProduct} onClose={() => setExtrasProduct(null)} product={extrasProduct} />
      <ComboSwapModal open={!!comboModal} onClose={() => setComboModal(null)} combo={comboModal} />
    </div>
  );
}
