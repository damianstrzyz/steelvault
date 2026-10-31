import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", destructive = false, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} onCancel={onCancel} className="m-auto w-[min(92vw,420px)] rounded-2xl border border-line bg-surface p-6 text-fg backdrop:bg-black/60">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-line px-4 hover:bg-surface-2">Cancel</button>
        <button type="button" onClick={onConfirm} className={`h-10 rounded-xl px-4 font-semibold ${destructive ? "bg-danger text-white" : "bg-accent text-accent-ink"}`}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}
