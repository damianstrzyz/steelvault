import { supabase } from "./supabase";

const BUCKET = "product-images";
// Resizing needs Supabase Storage image transformations (paid plans). Off by default.
const transformsEnabled = import.meta.env.VITE_IMAGE_TRANSFORMS === "true";

function url(path: string, width?: number): string {
  const options = transformsEnabled && width ? { transform: { width, quality: 75 } } : undefined;
  return supabase.storage.from(BUCKET).getPublicUrl(path, options).data.publicUrl;
}

const srcSet = (path: string, widths: number[]): string | undefined =>
  transformsEnabled ? widths.map((w) => `${url(path, w)} ${w}w`).join(", ") : undefined;

export function productImageUrl(path: string | null): string | null {
  return path ? url(path) : null;
}

/** Props for ProductCard: a medium default plus a responsive srcset when resizing is enabled. */
export function cardImageProps(path: string | null): { imageUrl: string | null; imageSrcSet?: string } {
  if (!path) return { imageUrl: null };
  return { imageUrl: url(path, 360), imageSrcSet: srcSet(path, [240, 360, 480]) };
}

export function detailImageProps(path: string | null): { src: string; srcSet?: string } | null {
  if (!path) return null;
  return { src: url(path, 640), srcSet: srcSet(path, [420, 640, 840]) };
}
