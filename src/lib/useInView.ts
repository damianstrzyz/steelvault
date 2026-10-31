import { useEffect, useRef } from "react";

/** Calls onEnter whenever the returned ref's element scrolls near the viewport. */
export function useInView<T extends Element>(onEnter: () => void, enabled: boolean) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) onEnter();
    }, { rootMargin: "400px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onEnter, enabled]);
  return ref;
}
