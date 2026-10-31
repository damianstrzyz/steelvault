import type { ReactNode } from "react";
import { X } from "lucide-react";

interface Props { open: boolean; onClose: () => void; children: ReactNode }

export function MobileFiltersDrawer({ open, onClose, children }: Props) {
  return (
    <div className={`fixed inset-0 z-40 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-transform duration-200 ${open ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mb-4 flex items-center justify-between">
          <strong>Filters</strong>
          <button type="button" onClick={onClose} aria-label="Close filters"><X className="size-5" /></button>
        </div>
        {children}
      </aside>
    </div>
  );
}
