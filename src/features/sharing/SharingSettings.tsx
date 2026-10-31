import { useState } from "react";
import { Copy, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { useToast } from "@/components/ui/toastContext";
import { shareUrl } from "./api";
import { useOwnSharing, useSharingActions } from "./queries";

function Option({ label, description, checked, disabled, onChange }: { label: string; description: string; checked: boolean; disabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" className="mt-1 size-4 accent-accent" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span><span className="block font-medium">{label}</span><span className="block text-sm text-muted">{description}</span></span>
    </label>
  );
}

export function SharingSettings() {
  const sharing = useOwnSharing();
  const { save, regenerate } = useSharingActions();
  const toast = useToast();
  const [confirmNew, setConfirmNew] = useState(false);

  const row = sharing.data ?? null;
  const enabled = row?.is_enabled ?? false;
  const showPrices = row?.show_prices ?? false;
  const showWishlist = row?.show_wishlist ?? false;
  const url = row ? shareUrl(row.share_id) : "";
  const busy = save.isPending || regenerate.isPending;

  function apply(next: Partial<{ enabled: boolean; showPrices: boolean; showWishlist: boolean }>) {
    save.mutate({ enabled, showPrices, showWishlist, ...next }, {
      onSuccess: () => { if (next.enabled !== undefined) toast.show(next.enabled ? "Sharing is on" : "Sharing is off", "success"); },
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.show("Link copied", "success");
    } catch {
      toast.show("Could not copy. Select the link and copy it manually.", "error");
    }
  }

  return (
    <section id="sharing" className="mt-6 scroll-mt-24 rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-lg font-semibold">Collection sharing</h2>
      <p className="mt-1 text-sm text-muted">Let anyone with your link view your collection, without needing an account.</p>

      <div className="mt-5">
        {sharing.isPending ? <PageSpinner />
          : sharing.isError ? <ErrorState message="We could not load your sharing settings." onRetry={() => void sharing.refetch()} />
          : (
            <div className="space-y-5">
              <Option label="Share my collection" description="Turn this off at any time to make your collection private again." checked={enabled} disabled={busy} onChange={(v) => apply({ enabled: v })} />

              {row && (
                <div className={enabled ? "" : "opacity-60"}>
                  <label htmlFor="share-url" className="mb-1.5 block text-sm text-muted">Your link{enabled ? "" : " (inactive while sharing is off)"}</label>
                  <div className="flex gap-2">
                    <input id="share-url" readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-4 text-sm" />
                    <Button variant="secondary" onClick={() => void copy()} aria-label="Copy link"><Copy className="size-4" />Copy</Button>
                    {enabled && <a href={url} target="_blank" rel="noreferrer" aria-label="Open shared page" className="grid size-11 place-items-center rounded-xl border border-line hover:bg-surface-2"><ExternalLink className="size-4" /></a>}
                  </div>
                  <button type="button" disabled={busy} onClick={() => setConfirmNew(true)} className="mt-3 inline-flex items-center gap-2 text-sm text-muted hover:text-fg disabled:opacity-50">
                    <RefreshCw className="size-4" />Generate a new link
                  </button>
                </div>
              )}

              {enabled && (
                <div className="space-y-4 border-t border-line pt-5">
                  <Option label="Show current values" description="Visitors see the estimated value of each item. Prices you paid are never shown." checked={showPrices} disabled={busy} onChange={(v) => apply({ showPrices: v })} />
                  <Option label="Show my wishlist" description="Adds a Wishlist tab to your shared page." checked={showWishlist} disabled={busy} onChange={(v) => apply({ showWishlist: v })} />
                </div>
              )}

              <p className="rounded-xl bg-surface-2 p-4 text-sm text-muted">
                Visitors see your display name and the products you own, with quantity and condition. They never see your email, username, notes, tags, purchase prices or photos.
              </p>
            </div>
          )}
      </div>

      <ConfirmDialog
        open={confirmNew}
        title="Generate a new link?"
        message="Your current link will stop working immediately. Anyone you shared it with will need the new one."
        confirmLabel="Generate new link"
        onConfirm={() => { setConfirmNew(false); regenerate.mutate(); }}
        onCancel={() => setConfirmNew(false)}
      />
    </section>
  );
}
