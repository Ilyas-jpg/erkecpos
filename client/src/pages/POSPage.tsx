import { useState } from "react";
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
      {/* Category Sidebar - desktop only */}
      <aside className="hidden lg:flex flex-col w-[100px] bg-bg-card border-r border-border shrink-0">
        <div className="flex-1 overflow-y-auto scroll-container py-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "w-full py-3 px-2 flex flex-col items-center gap-1 text-center transition-all",
              !selectedCategory
                ? "bg-accent-red/10 text-accent-red border-r-2 border-accent-red"
                : "text-text-secondary hover:bg-bg-surface"
            )}
          >
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-medium leading-tight">Tümü</span>
          </button>
          {categories.filter((c) => c.active === 1).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "w-full py-3 px-2 flex flex-col items-center gap-1 text-center transition-all",
                selectedCategory === cat.id
                  ? "bg-accent-red/10 text-accent-red border-r-2 border-accent-red"
                  : "text-text-secondary hover:bg-bg-surface"
              )}
            >
              <span className="text-xl">{cat.icon || "📋"}</span>
              <span className="text-[10px] font-medium leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Mobile category bar */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-bg-card border-b border-border overflow-x-auto">
        <div className="flex items-center gap-1 px-2 py-2 min-w-max">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap min-h-[40px] transition-all",
              !selectedCategory ? "bg-accent-red text-white" : "bg-bg-surface text-text-secondary"
            )}
          >
            Tümü
          </button>
          {categories.filter((c) => c.active === 1).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap min-h-[40px] transition-all",
                selectedCategory === cat.id ? "bg-accent-red text-white" : "bg-bg-surface text-text-secondary"
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 flex flex-col min-h-0 lg:pt-0 pt-[56px] pb-[64px] lg:pb-0">
        <ProductGrid
          search={search}
          onSearchChange={setSearch}
          onProductTap={handleProductTap}
          onComboTap={handleComboTap}
        />
      </div>

      {/* Order Panel - desktop */}
      <div className="hidden lg:flex">
        <OrderPanel />
      </div>

      {/* Mobile cart button */}
      {cartCount > 0 && !showOrder && (
        <button
          onClick={() => setShowOrder(true)}
          className="lg:hidden fixed bottom-20 left-4 right-4 bg-accent-green text-white py-4 rounded-2xl
            font-semibold text-center shadow-lg active:scale-[0.98] z-30"
        >
          Sepeti Gör ({cartCount} ürün)
        </button>
      )}

      {/* Mobile order overlay */}
      {showOrder && (
        <div className="lg:hidden fixed inset-0 z-50 bg-bg-darkest flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-semibold">Sipariş</h2>
            <button onClick={() => setShowOrder(false)} className="text-2xl text-text-secondary w-10 h-10 flex items-center justify-center">
              ×
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
