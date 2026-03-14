import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../lib/store";

const typeStyles = {
  success: "bg-accent-green/90 backdrop-blur-sm",
  error: "bg-accent-red/90 backdrop-blur-sm",
  info: "bg-accent-blue/90 backdrop-blur-sm",
  warning: "bg-accent-amber/90 backdrop-blur-sm",
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
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`${typeStyles[toast.type]} text-white px-5 py-3 shadow-lg shadow-black/20 pointer-events-auto cursor-pointer min-w-[260px]`}
            onClick={() => removeToast(toast.id)}
          >
            <p className="text-sm font-medium tracking-wide">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
