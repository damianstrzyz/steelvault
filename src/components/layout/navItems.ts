import type { PageKey } from "@/app/pages";
import { BarChart3, LayoutGrid, Library, type LucideIcon } from "lucide-react";

export interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean; preload: PageKey }

export const navItems: NavItem[] = [
  { to: "/", label: "Catalog", icon: LayoutGrid, end: true, preload: "catalog" },
  { to: "/collection", label: "My collection", icon: Library, preload: "collection" },
  { to: "/stats", label: "Statistics", icon: BarChart3, preload: "stats" },
];
