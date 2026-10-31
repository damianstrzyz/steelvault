import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ErrorState } from "@/components/ui/ErrorState";

export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "An unexpected error occurred while loading this page.";
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <ErrorState message={message} onRetry={() => window.location.reload()} />
    </div>
  );
}
