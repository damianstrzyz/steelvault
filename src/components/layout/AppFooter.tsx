import { Link } from "react-router-dom";

export function AppFooter() {
  return (
    <footer className="border-t border-line px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 text-sm text-muted">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <span>© {new Date().getFullYear()} Steelvault</span>
        <nav aria-label="Footer" className="flex gap-5">
          <Link to="/" className="hover:text-fg">Catalog</Link>
          <Link to="/collection" className="hover:text-fg">My collection</Link>
          <Link to="/stats" className="hover:text-fg">Statistics</Link>
        </nav>
      </div>
    </footer>
  );
}
