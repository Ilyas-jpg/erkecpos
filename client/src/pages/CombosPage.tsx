import { useState, useEffect } from "react";
import { useStore, type Combo } from "../lib/store";
import { api } from "../lib/api";
import { formatPrice, cn } from "../lib/utils";
import { Button } from "../components/shared/Button";
import { Modal } from "../components/shared/Modal";
import { Toggle } from "../components/shared/Toggle";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { TopBar } from "../components/layout/TopBar";

export function CombosPage() {
  const combos = useStore((s) => s.combos);
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const fetchCombos = useStore((s) => s.fetchCombos);
  const addToast = useStore((s) => s.addToast);

  const [formOpen, setFormOpen] = useState(false);
  const [editCombo, setEditCombo] = useState<Combo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [active, setActive] = useState(1);
  const [items, setItems] = useState<Array<{
    product_id: string; quantity: number; is_swappable: number; swap_category_id: string;
  }>>([]);

  useEffect(() => {
    if (editCombo) {
      setName(editCombo.name);
      setDescription(editCombo.description || "");
      setPrice(editCombo.price);
      setActive(editCombo.active ?? 1);
      setItems(
        editCombo.items?.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          is_swappable: i.isSwappable,
          swap_category_id: i.swapCategoryId || "",
        })) || []
      );
    } else {
      setName(""); setDescription(""); setPrice(0); setActive(1); setItems([]);
    }
  }, [editCombo]);

  const handleSave = async () => {
    try {
      const payload = { name, description, price, active, items: items.map((i, idx) => ({ ...i, sort_order: idx })) };
      if (editCombo) {
        await api.put(`/api/combos/${editCombo.id}`, payload);
        addToast("Menü güncellendi");
      } else {
        await api.post("/api/combos", payload);
        addToast("Menü oluşturuldu");
      }
      await fetchCombos();
      setFormOpen(false);
      setEditCombo(null);
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/api/combos/${deleteId}`);
    addToast("Menü silindi");
    await fetchCombos();
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Menü/Combo Yönetimi" />
      <div className="p-4 flex items-center justify-between border-b border-border shrink-0">
        <h2 className="text-lg font-semibold">{combos.length} Menü</h2>
        <Button onClick={() => { setEditCombo(null); setFormOpen(true); }}>+ Yeni Menü</Button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-container p-4 grid gap-3 auto-rows-min">
        {combos.map((combo) => (
          <div key={combo.id} className="bg-bg-card border border-border p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  📦 {combo.name}
                  {combo.active === 0 && <span className="text-[10px] bg-accent-red/20 text-accent-red px-1.5 py-0.5">Pasif</span>}
                </h3>
                <p className="text-sm text-text-muted mt-0.5">{combo.description}</p>
              </div>
              <div className="text-right">
                <div className="font-mono text-xl font-bold text-accent-purple">{formatPrice(combo.price)}</div>
                {combo.individualTotal && combo.individualTotal > combo.price && (
                  <div className="font-mono text-xs text-text-muted line-through">{formatPrice(combo.individualTotal)}</div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {combo.items?.map((item) => (
                <span key={item.id} className="text-xs bg-bg-surface px-2 py-1">
                  {item.productName} x{item.quantity} {item.isSwappable ? "↔" : ""}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="secondary" onClick={() => { setEditCombo(combo); setFormOpen(true); }}>Düzenle</Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteId(combo.id)}>Sil</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Combo Form */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditCombo(null); }} title={editCombo ? "Menüyü Düzenle" : "Yeni Menü"} size="lg">
        <div className="p-5 space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Menü adı"
            className="w-full bg-bg-surface border border-border px-4 py-3 text-sm min-h-[48px] focus:outline-none focus:border-accent-blue" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama"
            className="w-full bg-bg-surface border border-border px-4 py-3 text-sm min-h-[48px] focus:outline-none focus:border-accent-blue" />
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Fiyat"
            className="w-full bg-bg-surface border border-border px-4 py-3 text-sm min-h-[48px] focus:outline-none focus:border-accent-blue font-mono" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Ürünler</label>
              <Button size="sm" variant="secondary" onClick={() => setItems([...items, { product_id: "", quantity: 1, is_swappable: 0, swap_category_id: "" }])}>
                + Ürün Ekle
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <select value={item.product_id} onChange={(e) => {
                  const next = [...items]; next[idx].product_id = e.target.value; setItems(next);
                }} className="flex-1 bg-bg-surface border border-border px-2 py-2 text-sm min-h-[44px]">
                  <option value="">Ürün seçin</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" value={item.quantity} onChange={(e) => {
                  const next = [...items]; next[idx].quantity = Number(e.target.value); setItems(next);
                }} className="w-16 bg-bg-surface border border-border px-2 py-2 text-sm text-center min-h-[44px]" min={1} />
                <Toggle checked={item.is_swappable === 1} onChange={(v) => {
                  const next = [...items]; next[idx].is_swappable = v ? 1 : 0; setItems(next);
                }} />
                {item.is_swappable === 1 && (
                  <select value={item.swap_category_id} onChange={(e) => {
                    const next = [...items]; next[idx].swap_category_id = e.target.value; setItems(next);
                  }} className="bg-bg-surface border border-border px-2 py-2 text-xs min-h-[44px]">
                    <option value="">Swap Kat.</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
                <button onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-accent-red/20 text-accent-red">
                  ×
                </button>
              </div>
            ))}
          </div>

          <Toggle checked={active === 1} onChange={(v) => setActive(v ? 1 : 0)} label="Aktif" />
          <Button className="w-full" onClick={handleSave}>{editCombo ? "Kaydet" : "Oluştur"}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Menüyü Sil" message="Bu menüyü silmek istediğinize emin misiniz?" confirmText="Sil" />
    </div>
  );
}
