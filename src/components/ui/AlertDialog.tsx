import { useEffect, useRef } from "react";

interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string;
  buttonLabel?: string;
  onClose: () => void;
}

/** Single-button dialog for notices. Use ConfirmDialog when the user must choose. */
export function AlertDialog({ open, title, message, buttonLabel = "OK", onClose }: AlertDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} onCancel={onClose} className="m-auto w-[min(92vw,420px)] rounded-2xl border border-line bg-surface p-6 text-fg backdrop:bg-black/60">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className="h-10 rounded-xl bg-accent px-5 font-semibold text-accent-ink">{buttonLabel}</button>
      </div>
    </dialog>
  );
}
