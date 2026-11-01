import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RouteError } from "@/components/layout/RouteError";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { pageLoaders } from "./pages";

const CatalogPage = lazy(pageLoaders.catalog);
const ProductDetailPage = lazy(pageLoaders.product);
const CollectionPage = lazy(pageLoaders.collection);
const StatsPage = lazy(pageLoaders.stats);
const ProfilePage = lazy(pageLoaders.profile);
const LoginPage = lazy(pageLoaders.login);
const RegisterPage = lazy(pageLoaders.register);
const ResetPasswordPage = lazy(pageLoaders.resetPassword);
const SharedCollectionPage = lazy(pageLoaders.shared);
const NotFoundPage = lazy(pageLoaders.notFound);

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: "products/:slug", element: <ProductDetailPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "shared/:shareId", element: <SharedCollectionPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "collection", element: <CollectionPage /> },
          { path: "stats", element: <StatsPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
