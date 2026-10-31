import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonStyles } from "@/components/ui/buttonStyles";

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={SearchX}
      title="Page not found"
      description="The page you are looking for does not exist or has moved."
      action={<Link to="/" className={buttonStyles("primary")}>Back to catalog</Link>}
    />
  );
}
