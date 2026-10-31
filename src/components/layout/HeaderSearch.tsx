import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

export function HeaderSearch({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const current = params.get("q") ?? "";

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    navigate(value ? `/?q=${encodeURIComponent(value)}` : "/");
  }

  return (
    <form onSubmit={onSubmit} role="search" className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input key={current} name="q" type="search" defaultValue={current} placeholder="Search by title, EAN or CUSA…" aria-label="Search the catalog" className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-4 placeholder:text-muted" />
    </form>
  );
}
