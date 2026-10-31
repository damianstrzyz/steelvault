import { BarChart3, LayoutGrid, Library, type LucideIcon } from "lucide-react";

export interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean }

export const navItems: NavItem[] = [
  { to: "/", label: "Catalog", icon: LayoutGrid, end: true },
  { to: "/collection", label: "My collection", icon: Library },
  { to: "/stats", label: "Statistics", icon: BarChart3 },
];
