import { useRegisterSW } from "virtual:pwa-register/react";

const HOUR = 60 * 60 * 1000;

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) window.setInterval(() => { void registration.update(); }, HOUR);
    },
  });

  if (!needRefresh && !offlineReady) return null;
  const dismiss = () => { setNeedRefresh(false); setOfflineReady(false); };

  return (
    <div role="status" className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm shadow-lg">
        <span>{needRefresh ? "A new version is available." : "Ready to work offline."}</span>
        {needRefresh && <button type="button" onClick={() => void updateServiceWorker(true)} className="rounded-lg bg-accent px-3 py-1.5 font-semibold text-accent-ink">Reload</button>}
        <button type="button" onClick={dismiss} className="text-muted hover:text-fg">{needRefresh ? "Later" : "Dismiss"}</button>
      </div>
    </div>
  );
}
