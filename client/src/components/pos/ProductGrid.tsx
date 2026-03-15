import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useStore, type Product } from "../../lib/store";
import { ProductCard } from "./ProductCard";
import { ComboCard } from "./ComboCard";
import { SearchInput } from "../shared/SearchInput";
import { EmptyState } from "../shared/EmptyState";

interface ProductGridProps {
  search: string;
  onSearchChange: (v: string) => void;
  onProductTap: (product: Product, hasExtras: boolean) => void;
  onComboTap: (comboId: string) => void;
}

export function ProductGrid({ search, onSearchChange, onProductTap, onComboTap }: ProductGridProps) {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const combos = useStore((s) => s.combos);
  const selectedCategory = useStore((s) => s.selectedCategory);
  const cart = useStore((s) => s.cart);
  const extras = useStore((s) => s.extras);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.active === 1);
    if (selectedCategory) {
      list = list.filter((p) => p.categoryId === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, selectedCategory, search]);

  const filteredCombos = useMemo(() => {
    if (selectedCategory) return [];
    let list = combos.filter((c) => c.active === 1);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [combos, selectedCategory, search]);

  const productHasExtras = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (["cat-ana-yemek", "cat-corbalar", "cat-pilav-makarna", "cat-yan-urunler"].includes(p.categoryId || "")) {
        set.add(p.id);
      }
    }
    return set;
  }, [products]);

  const getCartQuantity = (productId: string) => {
    return cart
      .filter((c) => c.product_id === productId)
      .reduce((sum, c) => sum + c.quantity, 0);
  };

  const getCategoryColor = (categoryId: string | null) => {
    return categories.find((c) => c.id === categoryId)?.color || null;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search */}
      <div className="p-4 pb-2 shrink-0">
        <SearchInput value={search} onChange={onSearchChange} placeholder="Ürün ara..." />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto scroll-container px-4 pb-4">
        {/* Combos section */}
        {filteredCombos.length > 0 && (
          <div className="mb-5">
            <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.06em] mb-3">
              Menüler
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
              {filteredCombos.map((combo) => (
                <ComboCard key={combo.id} combo={combo} onTap={() => onComboTap(combo.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {filteredProducts.length > 0 ? (
          <div>
            {filteredCombos.length > 0 && (
              <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.06em] mb-3">
                Ürünler
              </h3>
            )}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryColor={getCategoryColor(product.categoryId)}
                    cartQuantity={getCartQuantity(product.id)}
                    hasExtras={productHasExtras.has(product.id)}
                    onTap={() => onProductTap(product, productHasExtras.has(product.id))}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <EmptyState icon={<Search className="w-7 h-7 text-text-muted" />} title="Ürün bulunamadı" />
        )}
      </div>
    </div>
  );
}
