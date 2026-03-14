import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
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

  // Category management state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", icon: "📋", color: "#ef4444" });
  const [editCatId, setEditCatId] = useState<string | null>(null);

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

      <div className="p-4 flex flex-wrap items-center gap-2.5 shrink-0 border-b border-separator">
        <SearchInput value={search} onChange={setSearch} placeholder="Ürün ara..." className="flex-1 min-w-[200px]" />
        <select
          value={filterCat || ""}
          onChange={(e) => setFilterCat(e.target.value || null)}
          className="bg-fill-tertiary border-0 rounded-[10px] px-3 py-2.5 text-[13px] min-h-[36px]"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <Toggle checked={showInactive} onChange={setShowInactive} label="Pasifler" />
        <Button variant="secondary" size="sm" onClick={() => setCatModalOpen(true)}>Kategoriler</Button>
        <Button variant="secondary" size="sm" onClick={() => setBulkOpen(true)}>Toplu Fiyat</Button>
        <Button size="sm" onClick={() => { setEditProduct(null); setFormOpen(true); }}>+ Yeni Ürün</Button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-container p-4">
        <div className="grid gap-1.5">
          {filtered.map((product) => {
            const cat = categories.find((c) => c.id === product.categoryId);
            return (
              <div
                key={product.id}
                className={cn(
                  "flex items-center gap-4 bg-bg-elevated rounded-[12px] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.15),0_0_0_0.5px_rgba(255,255,255,0.04)_inset]",
                  product.active === 0 && "opacity-40"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[14px] tracking-[-0.1px]">{product.name}</h3>
                    {cat && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-fill-quaternary rounded-[4px] text-text-muted">
                        {cat.icon} {cat.name}
                      </span>
                    )}
                    {product.active === 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-accent-red/12 text-accent-red rounded-[4px]">Pasif</span>
                    )}
                  </div>
                  {product.description && <p className="text-[12px] text-text-muted mt-0.5">{product.description}</p>}
                </div>
                <span className="font-mono text-[16px] font-bold text-accent-green tabular-nums">{formatPrice(product.price)}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditProduct(product); setFormOpen(true); }}
                    className="w-[34px] h-[34px] flex items-center justify-center bg-fill-quaternary rounded-[8px] text-text-muted hover:bg-fill-tertiary transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="w-[34px] h-[34px] flex items-center justify-center bg-fill-quaternary rounded-[8px] text-text-muted hover:bg-accent-red/15 hover:text-accent-red transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
                    "px-3 py-1.5 text-xs border rounded-lg min-h-[36px]",
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
              className={cn("p-3 border min-h-[48px]", bulkMode === "percent" ? "border-accent-blue bg-accent-blue/10" : "border-border")}>
              % Yüzde
            </button>
            <button onClick={() => setBulkMode("fixed")}
              className={cn("p-3 border min-h-[48px]", bulkMode === "fixed" ? "border-accent-blue bg-accent-blue/10" : "border-border")}>
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

      {/* Category Management Modal */}
      <Modal open={catModalOpen} onClose={() => { setCatModalOpen(false); setEditCatId(null); }} title="Kategori Yönetimi" size="md">
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Kategori adı"
              className="flex-1 bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[48px]" />
            <input value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} placeholder="İkon"
              className="w-16 bg-bg-surface border border-border rounded-xl px-2 py-3 text-sm text-center min-h-[48px]" />
            <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })}
              className="w-12 h-12 bg-bg-surface border border-border cursor-pointer" />
            <Button onClick={async () => {
              try {
                if (editCatId) {
                  await api.put(`/api/categories/${editCatId}`, catForm);
                  addToast("Kategori güncellendi");
                } else {
                  await api.post("/api/categories", catForm);
                  addToast("Kategori eklendi");
                }
                await fetchCategories();
                setCatForm({ name: "", icon: "📋", color: "#ef4444" });
                setEditCatId(null);
              } catch (err: any) { addToast(err.message, "error"); }
            }}>{editCatId ? "Güncelle" : "Ekle"}</Button>
          </div>
          <div className="space-y-1.5">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 bg-bg-surface border border-border rounded-xl p-3">
                <span className="text-lg">{cat.icon}</span>
                <span className="flex-1 font-medium text-sm">{cat.name}</span>
                <div className="w-4 h-4" style={{ background: cat.color || "#ef4444" }} />
                <button onClick={() => { setEditCatId(cat.id); setCatForm({ name: cat.name, icon: cat.icon || "📋", color: cat.color || "#ef4444" }); }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-bg-hover text-text-muted text-sm"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={async () => { await api.delete(`/api/categories/${cat.id}`); await fetchCategories(); addToast("Kategori silindi"); }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-accent-red/20 text-text-muted text-sm"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <NumpadModal open={priceNumpad} onClose={() => setPriceNumpad(false)} onConfirm={(v) => setForm({ ...form, price: v })} title="Fiyat" />
      <NumpadModal open={bulkNumpad} onClose={() => setBulkNumpad(false)} onConfirm={(v) => setBulkValue(v)} title="Değer" />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Ürünü Sil" message="Bu ürünü silmek istediğinize emin misiniz?" confirmText="Sil" />
    </div>
  );
}
