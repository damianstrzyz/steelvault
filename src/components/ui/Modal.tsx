import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps { open: boolean; title: string; onClose: () => void; children: ReactNode }

export function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="m-auto max-h-[90dvh] w-[min(94vw,560px)] overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-fg backdrop:bg-black/60"
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-surface-2"><X className="size-5" /></button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
