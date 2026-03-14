import { useState, useEffect } from "react";
import { ClipboardList, Coins, CheckCircle, Undo2, Tag, UtensilsCrossed, FileText, Trash2, Banknote, CreditCard, Wallet } from "lucide-react";
import { api } from "../lib/api";
import { formatPrice, formatDate, formatTime, todayISO, cn } from "../lib/utils";
import { Button } from "../components/shared/Button";
import { Modal } from "../components/shared/Modal";
import { TopBar } from "../components/layout/TopBar";
import { EmptyState } from "../components/shared/EmptyState";
import { useStore } from "../lib/store";
import { NumpadModal } from "../components/pos/NumpadModal";

interface DailyReport {
  totalOrders: number; totalRevenue: number; totalRefunds: number;
  totalDiscounts: number; totalServiceCharge: number; totalTax: number;
  totalWasteCost: number; totalCash: number; totalCard: number; netRevenue: number;
}
interface Order {
  id: string; order_number: number; status: string; subtotal: number;
  discount_amount: number; service_charge: number; tax_amount: number;
  total: number; payment_method: string; note: string;
  created_at: string; refund_amount: number;
}
interface CashEntry {
  id: string; type: string; amount: number; description: string; created_at: string;
}

export function AccountingPage() {
  const addToast = useStore((s) => s.addToast);
  const settings = useStore((s) => s.settings);
  const dailyTarget = settings?.daily_target?.amount || 10000;

  const [date, setDate] = useState(todayISO());
  const [tab, setTab] = useState<"report" | "orders" | "cash">("report");
  const [report, setReport] = useState<DailyReport | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
  const [refundModal, setRefundModal] = useState<Order | null>(null);
  const [refundNumpad, setRefundNumpad] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");
  const [cashModal, setCashModal] = useState(false);
  const [cashType, setCashType] = useState<"cash_in" | "cash_out" | "expense">("cash_in");
  const [cashNumpad, setCashNumpad] = useState(false);
  const [cashAmount, setCashAmount] = useState(0);
  const [cashDesc, setCashDesc] = useState("");
  const [orderDetail, setOrderDetail] = useState<any>(null);

  const load = async () => {
    const [r, o, c] = await Promise.all([
      api.get<DailyReport>(`/api/reports/daily?date=${date}`),
      api.get<Order[]>(`/api/orders?date=${date}`),
      api.get<CashEntry[]>(`/api/cash?date=${date}`),
    ]);
    setReport(r);
    setOrders(o);
    setCashEntries(c);
  };
  useEffect(() => { load(); }, [date]);

  const handleRefund = async () => {
    if (!refundModal) return;
    try {
      await api.put(`/api/orders/${refundModal.id}/refund`, {
        amount: refundAmount || refundModal.total,
        reason: refundReason || "İade",
      });
      addToast("İade yapıldı");
      setRefundModal(null);
      await load();
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const handleCashEntry = async () => {
    try {
      await api.post("/api/cash", {
        type: cashType,
        amount: cashType === "cash_out" || cashType === "expense" ? -Math.abs(cashAmount) : Math.abs(cashAmount),
        description: cashDesc,
      });
      addToast("Kasa hareketi eklendi");
      setCashModal(false);
      setCashAmount(0);
      setCashDesc("");
      await load();
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const handleCloseDay = async () => {
    try {
      await api.post("/api/reports/close-day", { date });
      addToast("Gün kapatıldı");
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const statusColors: Record<string, string> = {
    completed: "text-accent-green", cancelled: "text-accent-red",
    refunded: "text-accent-amber", open: "text-accent-blue",
  };
  const statusLabels: Record<string, string> = {
    completed: "Tamamlandı", cancelled: "İptal", refunded: "İade", open: "Açık",
  };

  const tabs = [
    { key: "report" as const, label: "Günlük Rapor" },
    { key: "orders" as const, label: "Siparişler" },
    { key: "cash" as const, label: "Kasa" },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Muhasebe" />

      <div className="p-4 flex flex-wrap items-center gap-3 border-b border-border shrink-0">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-bg-surface border border-border rounded-xl px-3 py-2.5 text-sm min-h-[48px]" />
        <div className="flex gap-1 bg-bg-surface rounded-xl p-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("px-4 py-2 text-sm font-medium min-h-[40px] transition-all rounded-lg",
                tab === t.key ? "bg-accent-red text-white" : "text-text-secondary hover:text-text-primary")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-container p-4">
        {/* Daily Report */}
        {tab === "report" && report && (
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="bg-bg-card rounded-2xl border border-white/[0.06] p-4 shadow-sm">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Günlük Hedef</span>
                <span className="font-mono">{formatPrice(report.netRevenue)} / {formatPrice(dailyTarget)}</span>
              </div>
              <div className="h-3 bg-bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-accent-green rounded-full transition-all"
                  style={{ width: `${Math.min(100, (report.netRevenue / dailyTarget) * 100)}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Sipariş", value: report.totalOrders, icon: <ClipboardList className="w-4 h-4" />, color: "text-accent-blue" },
                { label: "Brüt Ciro", value: formatPrice(report.totalRevenue), icon: <Coins className="w-4 h-4" />, color: "text-accent-green" },
                { label: "Net Gelir", value: formatPrice(report.netRevenue), icon: <CheckCircle className="w-4 h-4" />, color: "text-accent-green" },
                { label: "İadeler", value: formatPrice(report.totalRefunds), icon: <Undo2 className="w-4 h-4" />, color: "text-accent-red" },
                { label: "İndirimler", value: formatPrice(report.totalDiscounts), icon: <Tag className="w-4 h-4" />, color: "text-accent-amber" },
                { label: "Servis", value: formatPrice(report.totalServiceCharge), icon: <UtensilsCrossed className="w-4 h-4" />, color: "text-text-secondary" },
                { label: "KDV", value: formatPrice(report.totalTax), icon: <FileText className="w-4 h-4" />, color: "text-text-secondary" },
                { label: "Zayi", value: formatPrice(report.totalWasteCost), icon: <Trash2 className="w-4 h-4" />, color: "text-accent-red" },
                { label: "Nakit", value: formatPrice(report.totalCash), icon: <Banknote className="w-4 h-4" />, color: "text-accent-green" },
                { label: "Kart", value: formatPrice(report.totalCard), icon: <CreditCard className="w-4 h-4" />, color: "text-accent-blue" },
              ].map((stat) => (
                <div key={stat.label} className="bg-bg-card rounded-2xl border border-white/[0.06] p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={stat.color}>{stat.icon}</span>
                    <span className="text-xs text-text-muted">{stat.label}</span>
                  </div>
                  <span className={`font-mono text-lg font-bold ${stat.color}`}>
                    {typeof stat.value === "number" ? stat.value : stat.value}
                  </span>
                </div>
              ))}
            </div>

            <Button variant="primary" onClick={handleCloseDay} className="w-full">Gün Sonu Kapat</Button>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div className="space-y-2">
            {orders.length === 0 ? <EmptyState title="Bugün sipariş yok" icon={<ClipboardList className="w-7 h-7 text-text-muted" />} /> : orders.map((order) => (
              <div key={order.id} className="bg-bg-card rounded-2xl border border-white/[0.06] p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold">#{String(order.order_number).padStart(3, "0")}</span>
                    <span className={`ml-2 text-xs ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                    <div className="text-xs text-text-muted mt-0.5">{formatTime(order.created_at)}</div>
                  </div>
                  <span className="font-mono text-lg font-bold text-accent-green">{formatPrice(order.total)}</span>
                </div>
                {order.refund_amount > 0 && (
                  <div className="text-xs text-accent-red mt-1">İade: {formatPrice(order.refund_amount)}</div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" onClick={async () => {
                    const detail = await api.get(`/api/orders/${order.id}`);
                    setOrderDetail(detail);
                  }}>Detay</Button>
                  {order.status === "completed" && (
                    <Button size="sm" variant="ghost" onClick={() => {
                      setRefundModal(order); setRefundAmount(order.total); setRefundReason("");
                    }}>İade</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cash */}
        {tab === "cash" && (
          <div className="space-y-3">
            <Button variant="secondary" onClick={() => setCashModal(true)} className="w-full">+ Kasa Hareketi</Button>
            {cashEntries.length === 0 ? <EmptyState title="Kasa hareketi yok" icon={<Wallet className="w-7 h-7 text-text-muted" />} /> : cashEntries.map((entry) => (
              <div key={entry.id} className="bg-bg-card rounded-2xl border border-white/[0.06] p-4 shadow-sm flex justify-between items-center">
                <div>
                  <span className="text-xs bg-bg-surface px-2 py-0.5">{entry.type}</span>
                  <p className="text-sm mt-1">{entry.description}</p>
                  <span className="text-xs text-text-muted">{formatTime(entry.created_at)}</span>
                </div>
                <span className={cn("font-mono font-bold", entry.amount >= 0 ? "text-accent-green" : "text-accent-red")}>
                  {entry.amount >= 0 ? "+" : ""}{formatPrice(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refund Modal */}
      <Modal open={!!refundModal} onClose={() => setRefundModal(null)} title="İade" size="sm">
        <div className="p-5 space-y-4">
          <div className="text-center">
            <span className="font-mono text-2xl font-bold text-accent-red">{formatPrice(refundAmount)}</span>
          </div>
          <Button size="lg" variant="secondary" className="w-full" onClick={() => setRefundNumpad(true)}>
            Tutar Değiştir (Kısmi İade)
          </Button>
          <input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="İade sebebi"
            className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[48px] focus:outline-none focus:border-accent-blue" />
          <Button variant="danger" className="w-full" onClick={handleRefund}>İade Yap</Button>
        </div>
      </Modal>

      {/* Cash Entry Modal */}
      <Modal open={cashModal} onClose={() => setCashModal(false)} title="Kasa Hareketi" size="sm">
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {([["cash_in", "Giriş"], ["cash_out", "Çıkış"], ["expense", "Gider"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setCashType(key)}
                className={cn("p-3 border text-sm min-h-[48px]", cashType === key ? "border-accent-blue bg-accent-blue/10" : "border-border")}>
                {label}
              </button>
            ))}
          </div>
          <Button size="lg" variant="secondary" className="w-full font-mono" onClick={() => setCashNumpad(true)}>
            {cashAmount} ₺
          </Button>
          <input value={cashDesc} onChange={(e) => setCashDesc(e.target.value)} placeholder="Açıklama"
            className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[48px] focus:outline-none focus:border-accent-blue" />
          <Button className="w-full" onClick={handleCashEntry}>Kaydet</Button>
        </div>
      </Modal>

      {/* Order Detail Modal */}
      <Modal open={!!orderDetail} onClose={() => setOrderDetail(null)} title={`Sipariş #${String(orderDetail?.order_number || 0).padStart(3, "0")}`} size="md">
        <div className="p-5">
          {orderDetail?.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2 border-b border-border last:border-0">
              <div>
                <span className="text-sm font-medium">{item.quantity}x</span>
                <span className="text-sm ml-2">{item.product_id || item.combo_id}</span>
                {item.extras?.length > 0 && (
                  <div className="flex gap-1 mt-0.5">
                    {item.extras.map((e: any) => (
                      <span key={e.id} className="text-[10px] bg-bg-surface px-1">{e.extraName}</span>
                    ))}
                  </div>
                )}
              </div>
              <span className="font-mono text-sm">{formatPrice(item.total_price)}</span>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Ara Toplam</span><span className="font-mono">{formatPrice(orderDetail?.subtotal || 0)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Servis</span><span className="font-mono">{formatPrice(orderDetail?.service_charge || 0)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">KDV</span><span className="font-mono">{formatPrice(orderDetail?.tax_amount || 0)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-1"><span>Toplam</span><span className="font-mono text-accent-green">{formatPrice(orderDetail?.total || 0)}</span></div>
          </div>
        </div>
      </Modal>

      <NumpadModal open={refundNumpad} onClose={() => setRefundNumpad(false)} onConfirm={(v) => setRefundAmount(v)} title="İade Tutarı" />
      <NumpadModal open={cashNumpad} onClose={() => setCashNumpad(false)} onConfirm={(v) => setCashAmount(v)} title="Tutar" />
    </div>
  );
}
