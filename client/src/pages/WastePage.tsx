import { useState, useEffect } from "react";
import { useStore } from "../lib/store";
import { api } from "../lib/api";
import { Trash2 } from "lucide-react";
import { formatPrice, formatTime, todayISO } from "../lib/utils";
import { Button } from "../components/shared/Button";
import { TopBar } from "../components/layout/TopBar";
import { EmptyState } from "../components/shared/EmptyState";
import { NumpadModal } from "../components/pos/NumpadModal";

interface WasteEntry {
  id: string; productId: string; productName: string; quantity: number;
  reason: string; note: string; costEstimate: number; createdAt: string;
}

const reasonLabels: Record<string, string> = {
  expired: "Tarih Geçmiş", damaged: "Hasarlı", overcooked: "Yanmış",
  dropped: "Düşmüş", other: "Diğer",
};

export function WastePage() {
  const products = useStore((s) => s.products);
  const addToast = useStore((s) => s.addToast);

  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState<WasteEntry[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("other");
  const [note, setNote] = useState("");
  const [costEstimate, setCostEstimate] = useState(0);
  const [qtyNumpad, setQtyNumpad] = useState(false);
  const [costNumpad, setCostNumpad] = useState(false);

  const load = async () => {
    const [data, summary] = await Promise.all([
      api.get<WasteEntry[]>(`/api/waste?date=${date}`),
      api.get<{ totalCost: number }>(`/api/waste/summary?date=${date}`),
    ]);
    setEntries(data);
    setTotalCost(summary.totalCost);
  };
  useEffect(() => { load(); }, [date]);

  const handleAdd = async () => {
    if (!productId) { addToast("Ürün seçin", "error"); return; }
    try {
      await api.post("/api/waste", {
        product_id: productId, quantity, reason, note, cost_estimate: costEstimate,
      });
      addToast("Zayi kaydedildi");
      setProductId(""); setQuantity(1); setNote(""); setCostEstimate(0);
      await load();
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  // Auto-estimate cost when product changes
  useEffect(() => {
    const p = products.find((pr) => pr.id === productId);
    if (p) setCostEstimate(Math.round(p.price * quantity * 0.4 * 100) / 100); // ~40% cost estimate
  }, [productId, quantity]);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Zayi Takibi" />

      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-bg-surface border border-border rounded-xl px-3 py-2.5 text-sm min-h-[48px]" />
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl px-4 py-2.5">
            <span className="text-xs text-accent-red">Toplam Zayi</span>
            <span className="font-mono text-lg font-bold text-accent-red ml-2">{formatPrice(totalCost)}</span>
          </div>
        </div>

        {/* Add form */}
        <div className="bg-bg-card rounded-2xl border border-white/[0.06] p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={productId} onChange={(e) => setProductId(e.target.value)}
              className="bg-bg-surface border border-border rounded-xl px-3 py-3 text-sm min-h-[48px]">
              <option value="">Ürün seçin</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={reason} onChange={(e) => setReason(e.target.value)}
              className="bg-bg-surface border border-border rounded-xl px-3 py-3 text-sm min-h-[48px]">
              {Object.entries(reasonLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setQtyNumpad(true)}
              className="bg-bg-surface border border-border rounded-xl px-4 py-3 text-left font-mono text-sm min-h-[48px]">
              Adet: {quantity}
            </button>
            <button onClick={() => setCostNumpad(true)}
              className="bg-bg-surface border border-border rounded-xl px-4 py-3 text-left font-mono text-sm min-h-[48px]">
              Maliyet: {formatPrice(costEstimate)}
            </button>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Not"
              className="bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[48px] focus:outline-none focus:border-accent-blue" />
          </div>
          <Button variant="danger" className="w-full" onClick={handleAdd}>Zayi Kaydet</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-container p-4 space-y-2">
        {entries.length === 0 ? <EmptyState title="Bugün zayi kaydı yok" icon={<Trash2 className="w-7 h-7 text-text-muted" />} /> : entries.map((entry) => (
          <div key={entry.id} className="bg-bg-card rounded-2xl border border-white/[0.06] p-4 shadow-sm flex justify-between items-center">
            <div>
              <h4 className="font-medium text-sm">{entry.productName}</h4>
              <div className="flex gap-2 mt-0.5 text-xs text-text-muted">
                <span>{entry.quantity} adet</span>
                <span>{reasonLabels[entry.reason]}</span>
                <span>{formatTime(entry.createdAt)}</span>
              </div>
              {entry.note && <p className="text-xs text-text-muted italic mt-0.5">{entry.note}</p>}
            </div>
            <span className="font-mono font-bold text-accent-red">{formatPrice(entry.costEstimate)}</span>
          </div>
        ))}
      </div>

      <NumpadModal open={qtyNumpad} onClose={() => setQtyNumpad(false)} onConfirm={(v) => setQuantity(v)} title="Miktar" />
      <NumpadModal open={costNumpad} onClose={() => setCostNumpad(false)} onConfirm={(v) => setCostEstimate(v)} title="Maliyet" />
    </div>
  );
}
