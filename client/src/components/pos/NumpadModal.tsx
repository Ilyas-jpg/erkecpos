import { useState } from "react";
import { Modal } from "../shared/Modal";
import { Button } from "../shared/Button";

interface NumpadModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  title?: string;
  initialValue?: string;
  allowDecimal?: boolean;
}

export function NumpadModal({
  open, onClose, onConfirm,
  title = "Tutar Girin",
  initialValue = "",
  allowDecimal = true,
}: NumpadModalProps) {
  const [value, setValue] = useState(initialValue);

  const handleKey = (key: string) => {
    if (key === "C") {
      setValue("");
    } else if (key === "DEL") {
      setValue((v) => v.slice(0, -1));
    } else if (key === ".") {
      if (allowDecimal && !value.includes(".")) {
        setValue((v) => v + ".");
      }
    } else {
      setValue((v) => v + key);
    }
  };

  const handleConfirm = () => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onConfirm(num);
      setValue("");
      onClose();
    }
  };

  const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", allowDecimal ? "." : "DEL"];

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="p-5">
        <div className="bg-bg-surface border border-border p-4 mb-4 text-right">
          <span className="font-mono text-3xl font-bold text-text-primary">
            {value || "0"}
          </span>
          <span className="text-text-muted ml-1 text-lg">₺</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-4">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className={`h-14 text-lg font-semibold transition-all
                ${key === "C" ? "bg-accent-red/15 text-accent-red hover:bg-accent-red/25" : "bg-bg-surface hover:bg-bg-hover text-text-primary border border-border"}`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleKey("DEL")}
            className="flex-1 h-12 bg-bg-surface hover:bg-bg-hover text-text-secondary font-medium border border-border"
          >
            ← Sil
          </button>
          <Button size="lg" variant="success" className="flex-[2]" onClick={handleConfirm}>
            Onayla
          </Button>
        </div>
      </div>
    </Modal>
  );
}
