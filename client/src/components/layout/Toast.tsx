import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../lib/store";

const typeColors = {
  success: "bg-accent-green",
  error: "bg-accent-red",
  info: "bg-accent-blue",
  warning: "bg-accent-amber",
};

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`${typeColors[toast.type]} text-white px-5 py-3 rounded-xl shadow-lg pointer-events-auto cursor-pointer min-w-[280px]`}
            onClick={() => removeToast(toast.id)}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
