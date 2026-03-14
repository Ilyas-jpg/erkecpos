import { useState, useEffect } from "react";
import { Target } from "lucide-react";
import { api } from "../lib/api";
import { formatPrice, formatDate } from "../lib/utils";
import { Button } from "../components/shared/Button";
import { Modal } from "../components/shared/Modal";
import { Toggle } from "../components/shared/Toggle";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { TopBar } from "../components/layout/TopBar";
import { useStore } from "../lib/store";

interface Campaign {
  id: string; name: string; type: string; value: number;
  applies_to: string; target_id: string; min_order_amount: number;
  start_date: string; end_date: string; active: number;
}

export function CampaignsPage() {
  const addToast = useStore((s) => s.addToast);
  const categories = useStore((s) => s.categories);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", type: "percent", value: 0, applies_to: "all",
    target_id: "", min_order_amount: 0, start_date: "", end_date: "", active: 1,
  });

  const load = async () => {
    const data = await api.get<Campaign[]>("/api/campaigns");
    setCampaigns(data);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editCampaign) {
      setForm({
        name: editCampaign.name, type: editCampaign.type, value: editCampaign.value,
        applies_to: editCampaign.applies_to, target_id: editCampaign.target_id || "",
        min_order_amount: editCampaign.min_order_amount || 0,
        start_date: editCampaign.start_date || "", end_date: editCampaign.end_date || "",
        active: editCampaign.active,
      });
    } else {
      setForm({ name: "", type: "percent", value: 0, applies_to: "all", target_id: "", min_order_amount: 0, start_date: "", end_date: "", active: 1 });
    }
  }, [editCampaign]);

  const handleSave = async () => {
    try {
      if (editCampaign) {
        await api.put(`/api/campaigns/${editCampaign.id}`, form);
        addToast("Kampanya güncellendi");
      } else {
        await api.post("/api/campaigns", form);
        addToast("Kampanya oluşturuldu");
      }
      await load();
      setFormOpen(false);
      setEditCampaign(null);
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const typeLabels: Record<string, string> = {
    percent: "% İndirim", fixed: "₺ İndirim", bogo: "1 Al 1 Öde", free_extra: "Ücretsiz Ekstra",
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Kampanya Yönetimi" />
      <div className="p-4 flex items-center justify-between border-b border-border shrink-0">
        <h2 className="text-lg font-semibold">{campaigns.length} Kampanya</h2>
        <Button onClick={() => { setEditCampaign(null); setFormOpen(true); }}>+ Yeni Kampanya</Button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-container p-4 grid gap-3 auto-rows-min">
        {campaigns.map((camp) => (
          <div key={camp.id} className="bg-bg-card rounded-2xl border border-white/[0.06] p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent-amber" /> {camp.name}
                  {camp.active === 0 && <span className="text-[10px] bg-accent-red/20 text-accent-red px-1.5 py-0.5">Pasif</span>}
                </h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-accent-purple/20 text-accent-purple rounded-lg px-2 py-0.5">{typeLabels[camp.type]}</span>
                  <span className="text-xs text-text-muted">{camp.applies_to}</span>
                </div>
              </div>
              <span className="font-mono text-xl font-bold text-accent-amber">
                {camp.type === "percent" ? `%${camp.value}` : formatPrice(camp.value)}
              </span>
            </div>
            {(camp.start_date || camp.end_date) && (
              <p className="text-xs text-text-muted mt-2">
                {camp.start_date && formatDate(camp.start_date)} - {camp.end_date && formatDate(camp.end_date)}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="secondary" onClick={() => { setEditCampaign(camp); setFormOpen(true); }}>Düzenle</Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteId(camp.id)}>Sil</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditCampaign(null); }} title={editCampaign ? "Kampanyayı Düzenle" : "Yeni Kampanya"} size="md">
        <div className="p-5 space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kampanya adı"
            className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[48px] focus:outline-none focus:border-accent-blue" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-bg-surface border border-border rounded-xl px-3 py-3 text-sm min-h-[48px]">
              <option value="percent">% İndirim</option>
              <option value="fixed">₺ Sabit İndirim</option>
              <option value="bogo">1 Al 1 Öde</option>
              <option value="free_extra">Ücretsiz Ekstra</option>
            </select>
            <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              placeholder="Değer" className="bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[48px] font-mono focus:outline-none focus:border-accent-blue" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.applies_to} onChange={(e) => setForm({ ...form, applies_to: e.target.value })}
              className="bg-bg-surface border border-border rounded-xl px-3 py-3 text-sm min-h-[48px]">
              <option value="all">Tümü</option>
              <option value="category">Kategori</option>
              <option value="product">Ürün</option>
              <option value="combo">Menü</option>
            </select>
            <input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
              placeholder="Min tutar" className="bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[48px] font-mono focus:outline-none focus:border-accent-blue" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="bg-bg-surface border border-border rounded-xl px-3 py-3 text-sm min-h-[48px]" />
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="bg-bg-surface border border-border rounded-xl px-3 py-3 text-sm min-h-[48px]" />
          </div>
          <Toggle checked={form.active === 1} onChange={(v) => setForm({ ...form, active: v ? 1 : 0 })} label="Aktif" />
          <Button className="w-full" onClick={handleSave}>{editCampaign ? "Kaydet" : "Oluştur"}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={async () => { await api.delete(`/api/campaigns/${deleteId}`); await load(); setDeleteId(null); addToast("Kampanya silindi"); }}
        title="Kampanyayı Sil" message="Bu kampanyayı silmek istediğinize emin misiniz?" confirmText="Sil" />
    </div>
  );
}
