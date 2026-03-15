import { useState } from "react";
import { Delete } from "lucide-react";
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
        {/* Display */}
        <div className="bg-bg-tertiary border border-border rounded-[14px] p-4 mb-4 text-right">
          <span className="font-mono text-[28px] font-bold text-text-primary tabular-nums">
            {value || "0"}
          </span>
          <span className="text-text-muted ml-1 text-[18px]">₺</span>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className={`h-[56px] text-[18px] font-semibold rounded-[12px] transition-all active:scale-95 flex items-center justify-center
                ${key === "C" ? "bg-accent-red/12 text-accent-red" : "bg-bg-tertiary hover:bg-bg-hover text-text-primary border border-border"}`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleKey("DEL")}
            className="flex-1 h-[48px] bg-bg-tertiary hover:bg-bg-hover text-text-secondary font-medium border border-border rounded-[12px] flex items-center justify-center gap-2 text-[15px]"
          >
            <Delete className="w-[18px] h-[18px]" /> Sil
          </button>
          <Button size="lg" variant="success" className="flex-[2]" onClick={handleConfirm}>
            Onayla
          </Button>
        </div>
      </div>
    </Modal>
  );
}
