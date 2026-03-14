import { useState, useEffect } from "react";
import { useStore, type Product } from "../lib/store";
import { api } from "../lib/api";
import { formatPrice, cn } from "../lib/utils";
import { Button } from "../components/shared/Button";
import { Modal } from "../components/shared/Modal";
import { SearchInput } from "../components/shared/SearchInput";
import { Toggle } from "../components/shared/Toggle";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { TopBar } from "../components/layout/TopBar";
import { NumpadModal } from "../components/pos/NumpadModal";

export function MenuManagePage() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const extras = useStore((s) => s.extras);
  const fetchProducts = useStore((s) => s.fetchProducts);
  const fetchCategories = useStore((s) => s.fetchCategories);
  const addToast = useStore((s) => s.addToast);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "", description: "", price: 0, category_id: "",
    active: 1, sort_order: 0, extra_ids: [] as string[],
  });
  const [priceNumpad, setPriceNumpad] = useState(false);

  // Bulk price state
  const [bulkCat, setBulkCat] = useState("");
  const [bulkMode, setBulkMode] = useState<"percent" | "fixed">("percent");
  const [bulkValue, setBulkValue] = useState(0);
  const [bulkNumpad, setBulkNumpad] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        description: editProduct.description || "",
        price: editProduct.price,
        category_id: editProduct.categoryId || "",
        active: editProduct.active ?? 1,
        sort_order: editProduct.sortOrder ?? 0,
        extra_ids: [],
      });
      // Load extras for this product
      api.get<any>(`/api/products/${editProduct.id}`).then((data) => {
        setForm((f) => ({ ...f, extra_ids: (data.extras || []).map((e: any) => e.id) }));
      });
    } else {
      setForm({ name: "", description: "", price: 0, category_id: "", active: 1, sort_order: 0, extra_ids: [] });
    }
  }, [editProduct]);

  const filtered = products.filter((p) => {
    if (filterCat && p.categoryId !== filterCat) return false;
    if (!showInactive && p.active === 0) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSave = async () => {
    try {
      if (editProduct) {
        await api.put(`/api/products/${editProduct.id}`, form);
        addToast("Ürün güncellendi");
      } else {
        await api.post("/api/products", form);
        addToast("Ürün eklendi");
      }
      await fetchProducts();
      setFormOpen(false);
      setEditProduct(null);
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/products/${deleteId}`);
      addToast("Ürün silindi");
      await fetchProducts();
    } catch (err: any) {
      addToast(err.message, "error");
    }
    setDeleteId(null);
  };

  const handleBulkPrice = async () => {
    try {
      const res = await api.patch<{ updated: number }>("/api/products/bulk-price", {
        category_id: bulkCat || undefined,
        mode: bulkMode,
        value: bulkValue,
      });
      addToast(`${res.updated} ürün güncellendi`);
      await fetchProducts();
      setBulkOpen(false);
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Menü Yönetimi" />

      <div className="p-4 flex flex-wrap items-center gap-3 shrink-0 border-b border-border">
        <SearchInput value={search} onChange={setSearch} placeholder="Ürün ara..." className="flex-1 min-w-[200px]" />
        <select
          value={filterCat || ""}
          onChange={(e) => setFilterCat(e.target.value || null)}
          className="bg-bg-surface border border-border rounded-xl px-3 py-2.5 text-sm min-h-[48px]"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <Toggle checked={showInactive} onChange={setShowInactive} label="Pasifler" />
        <Button variant="secondary" onClick={() => setBulkOpen(true)}>Toplu Fiyat</Button>
        <Button onClick={() => { setEditProduct(null); setFormOpen(true); }}>+ Yeni Ürün</Button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-container p-4">
        <div className="grid gap-2">
          {filtered.map((product) => {
            const cat = categories.find((c) => c.id === product.categoryId);
            return (
              <div
                key={product.id}
                className={cn(
                  "flex items-center gap-4 bg-bg-card border border-border rounded-xl p-4",
                  product.active === 0 && "opacity-50"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{product.name}</h3>
                    {cat && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-surface text-text-muted">
                        {cat.icon} {cat.name}
                      </span>
                    )}
                    {product.active === 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red">Pasif</span>
                    )}
                  </div>
                  {product.description && <p className="text-xs text-text-muted mt-0.5">{product.description}</p>}
                </div>
                <span className="font-mono text-lg font-bold text-accent-green">{formatPrice(product.price)}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditProduct(product); setFormOpen(true); }}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-bg-surface hover:bg-bg-hover text-text-secondary"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-bg-surface hover:bg-accent-red/20 text-text-secondary"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Form Modal */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditProduct(null); }} title={editProduct ? "Ürünü Düzenle" : "Yeni Ürün"} size="lg">
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Ürün Adı</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[48px] focus:outline-none focus:border-accent-blue" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Açıklama</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[48px] focus:outline-none focus:border-accent-blue" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Kategori</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full bg-bg-surface border border-border rounded-xl px-3 py-3 text-sm min-h-[48px]">
                <option value="">Seçin</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Fiyat</label>
              <button
                onClick={() => setPriceNumpad(true)}
                className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-left font-mono text-sm min-h-[48px]"
              >
                {formatPrice(form.price)}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Ekstralar</label>
            <div className="flex flex-wrap gap-2">
              {extras.map((ext) => (
                <button
                  key={ext.id}
                  onClick={() => {
                    const ids = form.extra_ids.includes(ext.id)
                      ? form.extra_ids.filter((id) => id !== ext.id)
                      : [...form.extra_ids, ext.id];
                    setForm({ ...form, extra_ids: ids });
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs border min-h-[36px]",
                    form.extra_ids.includes(ext.id) ? "border-accent-blue bg-accent-blue/10 text-accent-blue" : "border-border text-text-muted"
                  )}
                >
                  {ext.name} ({ext.type})
                </button>
              ))}
            </div>
          </div>
          <Toggle checked={form.active === 1} onChange={(v) => setForm({ ...form, active: v ? 1 : 0 })} label="Aktif" />
          <Button className="w-full" onClick={handleSave}>{editProduct ? "Kaydet" : "Oluştur"}</Button>
        </div>
      </Modal>

      {/* Bulk Price Modal */}
      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Toplu Fiyat Güncelleme" size="sm">
        <div className="p-5 space-y-4">
          <select value={bulkCat} onChange={(e) => setBulkCat(e.target.value)}
            className="w-full bg-bg-surface border border-border rounded-xl px-3 py-3 text-sm min-h-[48px]">
            <option value="">Tüm Ürünler</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setBulkMode("percent")}
              className={cn("p-3 rounded-xl border min-h-[48px]", bulkMode === "percent" ? "border-accent-blue bg-accent-blue/10" : "border-border")}>
              % Yüzde
            </button>
            <button onClick={() => setBulkMode("fixed")}
              className={cn("p-3 rounded-xl border min-h-[48px]", bulkMode === "fixed" ? "border-accent-blue bg-accent-blue/10" : "border-border")}>
              ₺ Sabit
            </button>
          </div>
          <button onClick={() => setBulkNumpad(true)}
            className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-left font-mono min-h-[48px]">
            {bulkValue} {bulkMode === "percent" ? "%" : "₺"}
          </button>
          <Button className="w-full" variant="primary" onClick={handleBulkPrice}>
            Uygula
          </Button>
        </div>
      </Modal>

      <NumpadModal open={priceNumpad} onClose={() => setPriceNumpad(false)} onConfirm={(v) => setForm({ ...form, price: v })} title="Fiyat" />
      <NumpadModal open={bulkNumpad} onClose={() => setBulkNumpad(false)} onConfirm={(v) => setBulkValue(v)} title="Değer" />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Ürünü Sil" message="Bu ürünü silmek istediğinize emin misiniz?" confirmText="Sil" />
    </div>
  );
}
