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
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" onClick={onClose} />

          {/* Panel */}
          <motion.div
            className={`relative w-full ${sizeClasses[size]} rounded-[16px] overflow-hidden
              bg-bg-secondary
              border border-border
              shadow-[0_24px_80px_rgba(0,0,0,0.5)]`}
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 h-[56px] border-b border-separator shrink-0">
                <h2 className="text-[17px] font-semibold tracking-[-0.4px] truncate pr-3">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0
                    bg-fill-tertiary text-text-secondary
                    hover:bg-fill-secondary transition-colors"
                >
                  <X className="w-[14px] h-[14px]" strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="max-h-[80vh] overflow-y-auto scroll-container">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
