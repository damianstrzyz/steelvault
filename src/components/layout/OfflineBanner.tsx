import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 border-b border-line bg-surface-2 px-4 py-2 text-sm">
      <WifiOff className="size-4 text-accent" aria-hidden="true" />
      You are offline. Saved pages still work, but changes cannot be made until you reconnect.
    </div>
  );
}
