import { useState } from "react";
import { Banknote, CreditCard, Printer, ArrowLeftRight } from "lucide-react";
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

      addToast("Sipariş tamamlandı!", "success");
      clearCart();
      setCashAmount("");
      setNote("");
      onClose();
    } catch (err: any) {
      addToast(err.message || "Sipariş oluşturulamadı", "error");
    } finally {
      setLoading(false);
    }
  };

  const methods: { key: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { key: "cash", label: "Nakit", icon: <Banknote className="w-[20px] h-[20px]" /> },
    { key: "card", label: "Kart", icon: <CreditCard className="w-[20px] h-[20px]" /> },
    { key: "pos", label: "POS", icon: <Printer className="w-[20px] h-[20px]" /> },
    { key: "mixed", label: "Karışık", icon: <ArrowLeftRight className="w-[20px] h-[20px]" /> },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Ödeme" size="lg">
      <div className="p-5">
        {/* Summary */}
        <div className="bg-bg-tertiary rounded-[14px] p-4 mb-5">
          <div className="space-y-2">
            <div className="flex justify-between text-[15px]">
              <span className="text-text-secondary">Ara Toplam</span>
              <span className="font-mono tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[15px] text-accent-amber">
                <span>İndirim</span>
                <span className="font-mono tabular-nums">-{formatPrice(discount)}</span>
              </div>
            )}
            {serviceCharge > 0 && (
              <div className="flex justify-between text-[15px]">
                <span className="text-text-secondary">Servis</span>
                <span className="font-mono tabular-nums">{formatPrice(serviceCharge)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-[15px]">
                <span className="text-text-secondary">KDV</span>
                <span className="font-mono tabular-nums">{formatPrice(tax)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-3 border-t border-separator">
              <span className="text-[17px] font-semibold">TOPLAM</span>
              <span className="font-mono text-[22px] font-bold text-accent-green tabular-nums">{formatPrice(total)}</span>
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
                "flex flex-col items-center justify-center gap-1.5 p-3 border rounded-[12px] min-h-[68px] transition-all",
                method === m.key
                  ? "border-accent-green bg-accent-green/10 text-accent-green"
                  : "border-border bg-bg-tertiary text-text-secondary hover:bg-bg-hover"
              )}
            >
              {m.icon}
              <span className="text-[13px] font-medium leading-none">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Cash numpad */}
        {method === "cash" && (
          <div className="mb-5">
            <div className="bg-bg-tertiary rounded-[14px] p-4 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-[15px]">Alınan</span>
                <span className="font-mono text-[24px] font-bold tabular-nums">{cashAmount || "0"} ₺</span>
              </div>
              {cashNum >= total && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-separator">
                  <span className="text-text-secondary text-[15px]">Para Üstü</span>
                  <span className="font-mono text-[20px] font-bold text-accent-amber tabular-nums">
                    {formatPrice(change)}
                  </span>
                </div>
              )}
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 mb-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCashAmount(String(amt))}
                  className="flex-1 h-[44px] bg-bg-tertiary hover:bg-bg-hover text-[15px] font-mono border border-border rounded-[10px] flex items-center justify-center"
                >
                  {amt}₺
                </button>
              ))}
              <button
                onClick={() => setCashAmount(String(Math.ceil(total)))}
                className="flex-1 h-[44px] bg-accent-green/10 text-accent-green text-[15px] font-semibold border border-accent-green/30 rounded-[10px] flex items-center justify-center"
              >
                Tam
              </button>
            </div>

            {/* Numpad grid */}
            <div className="grid grid-cols-3 gap-2">
              {["7","8","9","4","5","6","1","2","3","C","0","."].map((key) => (
                <button
                  key={key}
                  onClick={() => handleNumpad(key)}
                  className={cn(
                    "h-[52px] text-[18px] font-semibold rounded-[12px] active:scale-95 transition-all flex items-center justify-center",
                    key === "C" ? "bg-accent-red/12 text-accent-red" : "bg-bg-tertiary hover:bg-bg-hover"
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
          className="w-full bg-bg-tertiary border border-border rounded-[12px] px-4 py-3 text-[15px] mb-5
            placeholder:text-text-muted h-[48px]"
        />

        {/* Complete */}
        <Button
          size="xl"
          variant="success"
          className="w-full"
          onClick={handleComplete}
          disabled={loading || (method === "cash" && cashNum < total)}
        >
          {loading ? "İşleniyor..." : `Siparişi Tamamla — ${formatPrice(total)}`}
        </Button>
      </div>
    </Modal>
  );
}
