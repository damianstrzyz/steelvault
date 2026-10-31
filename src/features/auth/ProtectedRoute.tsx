import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./authContext";
import { PageSpinner } from "@/components/ui/PageSpinner";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
