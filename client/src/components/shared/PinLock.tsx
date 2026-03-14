import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Delete } from "lucide-react";
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
        className="w-full max-w-[280px]"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-bg-card flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Lock className="w-8 h-8 text-text-secondary" />
          </div>
          <h1 className="text-[22px] font-semibold mb-1">Yönetim Paneli</h1>
          <p className="text-[13px] text-text-secondary">PIN kodunuzu girin</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={pin.length > i ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.15 }}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                pin.length > i
                  ? "bg-accent-green shadow-[0_0_8px_rgba(48,209,88,0.4)]"
                  : "bg-bg-surface"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className={`h-16 rounded-2xl text-xl font-medium transition-all active:scale-95
                ${key === "C" ? "bg-accent-red/15 text-accent-red" :
                  key === "DEL" ? "bg-bg-surface text-text-secondary flex items-center justify-center" :
                  "bg-bg-card text-text-primary hover:bg-bg-surface shadow-sm"}`}
            >
              {key === "DEL" ? <Delete className="w-5 h-5" /> : key}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={pin.length < 4}
          className="w-full h-14 bg-accent-blue text-white rounded-2xl font-semibold text-[17px]
            disabled:opacity-30 disabled:pointer-events-none active:scale-[0.97] transition-all shadow-sm"
        >
          Giriş Yap
        </button>
      </motion.div>
    </div>
  );
}
