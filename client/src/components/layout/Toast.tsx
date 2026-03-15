import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../lib/store";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

const typeConfig = {
  success: { bg: "bg-accent-green", Icon: CheckCircle2 },
  error: { bg: "bg-accent-red", Icon: XCircle },
  info: { bg: "bg-accent-blue", Icon: Info },
  warning: { bg: "bg-accent-amber", Icon: AlertCircle },
};

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-[340px]">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { bg, Icon } = typeConfig[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className={`${bg} text-white px-4 py-3.5 rounded-[14px] shadow-lg pointer-events-auto cursor-pointer flex items-center gap-3`}
              onClick={() => removeToast(toast.id)}
            >
              <Icon className="w-[20px] h-[20px] shrink-0" />
              <p className="text-[15px] font-medium leading-tight">{toast.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
