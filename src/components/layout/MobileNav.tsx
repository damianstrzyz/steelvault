import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { navItems } from "./navItems";
import { AccountActions } from "./AccountActions";

interface MobileNavProps { open: boolean; onClose: () => void }

export function MobileNav({ open, onClose }: MobileNavProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`} />
      <nav aria-label="Mobile" className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-1 border-r border-line bg-surface p-4 pt-[calc(1rem+env(safe-area-inset-top))] transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight">Steel<span className="text-accent">vault</span></span>
          <button type="button" onClick={onClose} aria-label="Close menu" className="grid size-10 place-items-center rounded-xl hover:bg-surface-2"><X className="size-5" /></button>
        </div>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 ${isActive ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"}`}>
            <Icon className="size-5" />{label}
          </NavLink>
        ))}
        <div className="mt-auto pb-[env(safe-area-inset-bottom)]"><AccountActions onNavigate={onClose} /></div>
      </nav>
    </div>
  );
}
