import { Loader2 } from "lucide-react";

export function PageSpinner() {
  return (
    <div className="grid min-h-[40vh] place-items-center text-muted" role="status" aria-label="Loading">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
