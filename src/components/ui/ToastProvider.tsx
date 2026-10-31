import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { ToastContext, type ToastApi, type ToastVariant } from "./toastContext";

interface ToastItem { id: number; message: string; variant: ToastVariant }

const icons = { success: CheckCircle2, error: AlertCircle, info: Info } as const;
const tones = { success: "text-ok", error: "text-danger", info: "text-accent" } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = ++counter.current;
    setItems((prev) => [...prev.slice(-2), { id, message, variant }]);
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const api = useMemo<ToastApi>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {items.map((t) => {
          const Icon = icons[t.variant];
          return (
            <div key={t.id} className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm shadow-lg">
              <Icon className={`size-5 shrink-0 ${tones[t.variant]}`} />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
