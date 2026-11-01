import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Disc3, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ProductCardProps {
  to: string;
  name: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string | null;
  imageSrcSet?: string;
  /** Called when the card is hovered or focused, to warm up the destination page. */
  onPrefetch?: () => void;
  /** true = owned, false = missing, null/undefined = collection state unknown (signed out). */
  owned?: boolean | null;
  onToggleOwned?: () => void;
  /** Extra content under the image (kept outside the link so it can hold buttons). */
  footer?: ReactNode;
}

export function ProductCard({ to, name, subtitle, badge, imageUrl, imageSrcSet, onPrefetch, owned, onToggleOwned, footer }: ProductCardProps) {
  const missing = owned === false;
  return (
    <div className="group relative rounded-2xl border border-line bg-surface p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-accent">
      <Link to={to} onMouseEnter={onPrefetch} onFocus={onPrefetch} className="block rounded-xl focus-visible:outline-offset-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">{name}</h3>
          {badge && <Badge>{badge}</Badge>}
        </div>
        {subtitle && <p className="mt-1 truncate text-xs text-muted sm:text-sm">{subtitle}</p>}
        <div className={`mt-3 aspect-[3/4] overflow-hidden rounded-xl bg-surface-2 ${missing ? "opacity-60 grayscale" : ""}`}>
          {imageUrl
            ? <img src={imageUrl} srcSet={imageSrcSet} sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" alt={name} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
            : <div className="grid size-full place-items-center text-muted"><Disc3 className="size-10" aria-hidden="true" /></div>}
        </div>
      </Link>
      {footer}
      {onToggleOwned && (
        <button
          type="button"
          onClick={onToggleOwned}
          aria-pressed={owned === true}
          aria-label={owned ? `Remove ${name} from collection` : `Add ${name} to collection`}
          className={`absolute bottom-6 right-6 grid size-9 place-items-center rounded-full border-2 text-white shadow ${owned ? "border-ok bg-ok" : "border-white/80 bg-black/55 hover:bg-black/75"}`}
        >
          {owned ? <Check className="size-4" /> : <Plus className="size-4" />}
        </button>
      )}
    </div>
  );
}
