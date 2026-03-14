import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../lib/store";

export function PinLock({ children }: { children: React.ReactNode }) {
  const isAdmin = useStore((s) => s.isAdmin);
  const loginAdmin = useStore((s) => s.loginAdmin);
  const addToast = useStore((s) => s.addToast);
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  if (isAdmin) return <>{children}</>;

  const handleKey = (key: string) => {
    if (key === "C") {
      setPin("");
    } else if (key === "DEL") {
      setPin((v) => v.slice(0, -1));
    } else if (pin.length < 8) {
      const newPin = pin + key;
      setPin(newPin);

      // Auto-submit when 6 digits entered
      if (newPin.length >= 6) {
        setTimeout(() => {
          if (loginAdmin(newPin)) {
            addToast("Yönetim paneline hoş geldiniz", "success");
          } else {
            setShake(true);
            setTimeout(() => { setShake(false); setPin(""); }, 500);
            addToast("Hatalı PIN", "error");
          }
        }, 150);
      }
    }
  };

  const handleSubmit = () => {
    if (pin.length < 4) return;
    if (loginAdmin(pin)) {
      addToast("Yönetim paneline hoş geldiniz", "success");
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setPin(""); }, 500);
      addToast("Hatalı PIN", "error");
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"];

  return (
    <div className="h-full flex items-center justify-center bg-bg-darkest">
      <motion.div
        animate={shake ? { x: [-12, 12, -12, 12, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xs"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-bg-card border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold mb-1">Yönetim Paneli</h1>
          <p className="text-sm text-text-secondary">PIN kodunu girin</p>
        </div>

        {/* PIN dots */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={pin.length > i ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.15 }}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > i
                  ? "bg-accent-green border-accent-green"
                  : "bg-transparent border-text-muted"
              }`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className={`h-16 rounded-2xl text-xl font-semibold transition-all active:scale-95
                ${key === "C" ? "bg-accent-red/15 text-accent-red" :
                  key === "DEL" ? "bg-bg-surface text-text-secondary text-base" :
                  "bg-bg-card border border-border text-text-primary hover:bg-bg-surface"}`}
            >
              {key === "DEL" ? "←" : key}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={pin.length < 4}
          className="w-full h-14 bg-accent-green text-white rounded-2xl font-semibold text-lg
            disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] transition-all"
        >
          Giriş
        </button>
      </motion.div>
    </div>
  );
}
