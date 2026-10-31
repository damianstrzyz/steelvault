import { TriangleAlert } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps { title?: string; message?: string; onRetry?: () => void }

export function ErrorState({ title = "Something went wrong", message = "Please try again in a moment.", onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-16 text-center">
      <TriangleAlert className="size-10 text-danger" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      {onRetry && <Button className="mt-6" variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
