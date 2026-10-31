import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import { navItems } from "./navItems";
import { HeaderSearch } from "./HeaderSearch";
import { AccountActions } from "./AccountActions";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 md:gap-6">
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="grid size-11 place-items-center rounded-xl hover:bg-surface-2 md:hidden"><Menu className="size-5" /></button>
        <Link to="/" className="text-xl font-extrabold tracking-tight">Steel<span className="text-accent">vault</span></Link>
        <nav className="hidden gap-1 md:flex" aria-label="Main">
          {navItems.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"}`}>{label}</NavLink>
          ))}
        </nav>
        <HeaderSearch className="ml-auto hidden w-full max-w-md md:block" />
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />
          <div className="hidden md:block"><AccountActions /></div>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden"><HeaderSearch /></div>
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
