import type { ReactNode } from "react";

export function Badge({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "neutral" | "ok" }) {
  const tones = { accent: "bg-accent text-accent-ink", neutral: "bg-surface-2 text-muted", ok: "bg-ok text-white" } as const;
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
