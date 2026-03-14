import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useStore } from "../../lib/store";
import { formatPrice } from "../../lib/utils";
import { OrderItem } from "./OrderItem";
import { PaymentModal } from "./PaymentModal";
import { Button } from "../shared/Button";
import { EmptyState } from "../shared/EmptyState";
import { ShoppingCart } from "lucide-react";

export function OrderPanel() {
  const cart = useStore((s) => s.cart);
  const settings = useStore((s) => s.settings);
  const updateCartItemQuantity = useStore((s) => s.updateCartItemQuantity);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const clearCart = useStore((s) => s.clearCart);

  const [paymentOpen, setPaymentOpen] = useState(false);

  const serviceConfig = settings?.service_charge || { enabled: true, type: "percent", value: 10 };
  const taxConfig = settings?.tax_rate || { rate: 10 };

  const calculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
    const discount = 0;
    const afterDiscount = subtotal - discount;
    const serviceCharge = serviceConfig.enabled
      ? Math.round(afterDiscount * (serviceConfig.value / 100) * 100) / 100
      : 0;
    const tax = Math.round((afterDiscount + serviceCharge) * (taxConfig.rate / 100) * 100) / 100;
    const total = Math.round((afterDiscount + serviceCharge + tax) * 100) / 100;

    return { subtotal, discount, serviceCharge, tax, total };
  }, [cart, serviceConfig, taxConfig]);

  return (
    <>
      <div className="w-full lg:w-[340px] bg-bg-elevated border-l border-separator flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-separator shrink-0">
          <h2 className="text-[15px] font-semibold text-text-secondary tracking-[-0.2px]">Sipariş</h2>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[13px] text-accent-red font-medium min-h-[28px] px-2 transition-colors hover:opacity-70"
            >
              Temizle
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scroll-container p-3 space-y-1.5">
          {cart.length === 0 ? (
            <EmptyState icon={<ShoppingCart className="w-7 h-7 text-text-muted" />} title="Sepet boş" description="Ürün eklemek için menüden seçin" />
          ) : (
            <AnimatePresence>
              {cart.map((item) => (
                <OrderItem
                  key={item.id}
                  item={item}
                  onIncrement={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                  onDecrement={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-separator p-4 space-y-1 shrink-0">
            <div className="flex justify-between text-[13px]">
              <span className="text-text-muted">Ara Toplam</span>
              <span className="font-mono tabular-nums text-text-secondary">{formatPrice(calculations.subtotal)}</span>
            </div>
            {calculations.serviceCharge > 0 && (
              <div className="flex justify-between text-[13px]">
                <span className="text-text-muted">Servis %{serviceConfig.value}</span>
                <span className="font-mono tabular-nums text-text-secondary">{formatPrice(calculations.serviceCharge)}</span>
              </div>
            )}
            <div className="flex justify-between text-[13px]">
              <span className="text-text-muted">KDV %{taxConfig.rate}</span>
              <span className="font-mono tabular-nums text-text-secondary">{formatPrice(calculations.tax)}</span>
            </div>
            <div className="flex justify-between text-[20px] font-bold pt-3 mt-2 border-t border-separator">
              <span>Toplam</span>
              <span className="font-mono tabular-nums text-accent-green">{formatPrice(calculations.total)}</span>
            </div>

            <Button
              size="xl"
              variant="success"
              className="w-full mt-3"
              onClick={() => setPaymentOpen(true)}
            >
              Siparişi Tamamla
            </Button>
          </div>
        )}
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        subtotal={calculations.subtotal}
        discount={calculations.discount}
        serviceCharge={calculations.serviceCharge}
        tax={calculations.tax}
        total={calculations.total}
      />
    </>
  );
}
