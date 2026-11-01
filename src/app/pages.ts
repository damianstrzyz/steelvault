/** One loader per page chunk. Shared by React.lazy (routes.tsx) and hover/idle preloading. */
export const pageLoaders = {
  catalog: () => import("@/pages/CatalogPage"),
  product: () => import("@/pages/ProductDetailPage"),
  collection: () => import("@/pages/CollectionPage"),
  stats: () => import("@/pages/StatsPage"),
  profile: () => import("@/pages/ProfilePage"),
  login: () => import("@/pages/LoginPage"),
  register: () => import("@/pages/RegisterPage"),
  resetPassword: () => import("@/pages/ResetPasswordPage"),
  shared: () => import("@/pages/SharedCollectionPage"),
  notFound: () => import("@/pages/NotFoundPage"),
} as const;

export type PageKey = keyof typeof pageLoaders;

export function preloadPage(key: PageKey): void {
  pageLoaders[key]().catch(() => { /* offline or deploy in progress: React.lazy will retry on navigation */ });
}
