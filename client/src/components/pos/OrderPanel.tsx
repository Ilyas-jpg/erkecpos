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
      <div className="w-full lg:w-[340px] bg-bg-secondary border-l border-separator flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-[52px] border-b border-separator shrink-0">
          <h2 className="text-[17px] font-semibold tracking-[-0.4px]">Sipariş</h2>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[15px] text-accent-red font-medium min-h-[44px] px-2 flex items-center transition-colors hover:opacity-70"
            >
              Temizle
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto scroll-container p-4 space-y-2">
          {cart.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="w-7 h-7 text-text-muted" />}
              title="Sepet boş"
              description="Ürün eklemek için menüden seçin"
            />
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

        {/* Summary */}
        {cart.length > 0 && (
          <div className="border-t border-separator p-4 shrink-0">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[15px]">
                <span className="text-text-secondary">Ara Toplam</span>
                <span className="font-mono tabular-nums">{formatPrice(calculations.subtotal)}</span>
              </div>
              {calculations.serviceCharge > 0 && (
                <div className="flex justify-between text-[15px]">
                  <span className="text-text-secondary">Servis %{serviceConfig.value}</span>
                  <span className="font-mono tabular-nums">{formatPrice(calculations.serviceCharge)}</span>
                </div>
              )}
              <div className="flex justify-between text-[15px]">
                <span className="text-text-secondary">KDV %{taxConfig.rate}</span>
                <span className="font-mono tabular-nums">{formatPrice(calculations.tax)}</span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline pt-3 border-t border-separator">
                <span className="text-[17px] font-semibold">Toplam</span>
                <span className="font-mono text-[22px] font-bold tabular-nums text-accent-green">
                  {formatPrice(calculations.total)}
                </span>
              </div>
            </div>

            <Button
              size="xl"
              variant="success"
              className="w-full"
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
