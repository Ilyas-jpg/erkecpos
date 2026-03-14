import { useState } from "react";
import { Modal } from "../shared/Modal";
import { Button } from "../shared/Button";
import { cn, formatPrice } from "../../lib/utils";
import { useStore } from "../../lib/store";
import { api } from "../../lib/api";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  discount: number;
  serviceCharge: number;
  tax: number;
  total: number;
}

type PaymentMethod = "cash" | "card" | "pos" | "mixed";

export function PaymentModal({ open, onClose, subtotal, discount, serviceCharge, tax, total }: PaymentModalProps) {
  const cart = useStore((s) => s.cart);
  const clearCart = useStore((s) => s.clearCart);
  const addToast = useStore((s) => s.addToast);

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const cashNum = parseFloat(cashAmount) || 0;
  const change = method === "cash" ? cashNum - total : 0;

  const handleNumpad = (key: string) => {
    if (key === "C") setCashAmount("");
    else if (key === "DEL") setCashAmount((v) => v.slice(0, -1));
    else if (key === "." && !cashAmount.includes(".")) setCashAmount((v) => v + ".");
    else if (key !== ".") setCashAmount((v) => v + key);
  };

  const quickAmounts = [50, 100, 200, 500];

  const handleComplete = async () => {
    if (method === "cash" && cashNum < total) {
      addToast("Alınan tutar yetersiz", "error");
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map((item) => ({
        product_id: item.product_id,
        combo_id: item.combo_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        note: item.note,
        extras: item.extras.map((e) => ({
          extra_id: e.extra_id,
          price: e.price,
        })),
      }));

      await api.post("/api/orders", {
        items: orderItems,
        payment_method: method,
        note: note || undefined,
        discount_amount: discount,
        status: "completed",
      });

      addToast("Siparis tamamlandi!", "success");
      clearCart();
      setCashAmount("");
      setNote("");
      onClose();
    } catch (err: any) {
      addToast(err.message || "Siparis olusturulamadi", "error");
    } finally {
      setLoading(false);
    }
  };

  const methods: { key: PaymentMethod; label: string; icon: string }[] = [
    { key: "cash", label: "Nakit", icon: "💵" },
    { key: "card", label: "Kart", icon: "💳" },
    { key: "pos", label: "POS", icon: "🖨️" },
    { key: "mixed", label: "Karışık", icon: "🔄" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Ödeme" size="lg">
      <div className="p-5">
        {/* Summary */}
        <div className="bg-bg-surface rounded-xl p-4 mb-5">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Ara Toplam</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent-amber">
                <span>İndirim</span>
                <span className="font-mono">-{formatPrice(discount)}</span>
              </div>
            )}
            {serviceCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Servis</span>
                <span className="font-mono">{formatPrice(serviceCharge)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">KDV</span>
                <span className="font-mono">{formatPrice(tax)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
              <span>TOPLAM</span>
              <span className="font-mono text-accent-green">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {methods.map((m) => (
            <button
              key={m.key}
              onClick={() => setMethod(m.key)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border min-h-[64px] transition-all",
                method === m.key
                  ? "border-accent-green bg-accent-green/10 text-accent-green"
                  : "border-border bg-bg-surface text-text-secondary hover:bg-bg-hover"
              )}
            >
              <span className="text-xl">{m.icon}</span>
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Cash numpad */}
        {method === "cash" && (
          <div className="mb-5">
            <div className="bg-bg-surface rounded-xl p-4 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Alınan</span>
                <span className="font-mono text-2xl font-bold">{cashAmount || "0"} ₺</span>
              </div>
              {cashNum >= total && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                  <span className="text-text-secondary text-sm">Para Üstü</span>
                  <span className="font-mono text-xl font-bold text-accent-amber">
                    {formatPrice(change)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCashAmount(String(amt))}
                  className="flex-1 py-2.5 rounded-lg bg-bg-surface hover:bg-bg-hover text-sm font-mono border border-border min-h-[44px]"
                >
                  {amt}₺
                </button>
              ))}
              <button
                onClick={() => setCashAmount(String(Math.ceil(total)))}
                className="flex-1 py-2.5 rounded-lg bg-accent-green/10 text-accent-green text-sm font-medium border border-accent-green/30 min-h-[44px]"
              >
                Tam
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {["7","8","9","4","5","6","1","2","3","C","0","."].map((key) => (
                <button
                  key={key}
                  onClick={() => handleNumpad(key)}
                  className={cn(
                    "h-12 rounded-lg text-lg font-semibold active:scale-95 transition-all",
                    key === "C" ? "bg-accent-red/20 text-accent-red" : "bg-bg-surface hover:bg-bg-hover"
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <input
          type="text"
          placeholder="Sipariş notu (opsiyonel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-sm mb-5
            placeholder:text-text-muted focus:outline-none focus:border-accent-blue min-h-[48px]"
        />

        {/* Complete */}
        <Button
          size="xl"
          variant="success"
          className="w-full"
          onClick={handleComplete}
          disabled={loading || (method === "cash" && cashNum < total)}
        >
          {loading ? "İşleniyor..." : `SİPARİŞİ TAMAMLA — ${formatPrice(total)}`}
        </Button>
      </div>
    </Modal>
  );
}
