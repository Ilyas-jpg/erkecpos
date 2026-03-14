import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

const sizeClasses = {
  sm: "max-w-[360px]",
  md: "max-w-[480px]",
  lg: "max-w-[600px]",
  full: "max-w-[95vw] max-h-[95vh]",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className={`relative w-full ${sizeClasses[size]} rounded-[16px] overflow-hidden
              bg-gradient-to-b from-[#1e1e22] to-[#18181c]
              shadow-[0_24px_80px_rgba(0,0,0,0.4),0_0_0_0.5px_rgba(255,255,255,0.06)_inset,0_1px_0_rgba(255,255,255,0.04)_inset]`}
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                <h2 className="text-[17px] font-semibold text-white/90 tracking-[-0.3px]">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-[28px] h-[28px] rounded-full flex items-center justify-center bg-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.12] transition-all duration-200"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>
            )}
            <div className="max-h-[80vh] overflow-y-auto scroll-container">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
