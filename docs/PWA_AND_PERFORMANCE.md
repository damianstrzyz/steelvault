# PWA, offline and performance notes

## What is cached offline
- The app shell (HTML, JS, CSS) is precached by the service worker, so the app opens offline.
- Public catalog API reads (products, categories, sets, prices, rates): network first, falling back
  to the last saved response for up to 7 days.
- Catalog images from the `product-images` bucket: saved for 30 days.
- NOT cached by the service worker: sign-in, profiles, your collection, sharing settings and
  anything called through database functions (statistics, shared pages). This is deliberate, so
  one user's private data can never be shown to another user on the same device.

## Updates
A new deployment shows a "new version available" bar with a Reload button. The app also checks for
updates every hour.

## Image resizing
Resizing needs Supabase Storage image transformations (paid plans). If your plan has them, set
`VITE_IMAGE_TRANSFORMS=true`. Cards then request 240, 360 or 480 px wide images and the product
page 420 to 840 px. Without it, the original files are used, so upload images no larger than about
1000 px wide (WebP, under 200 KB each) for best speed.

## Hosting requirements
- Single-page fallback: every path (for example `/collection`, `/shared/abc`) must serve `index.html`.
  Netlify: a `_redirects` file with `/* /index.html 200`. Vercel: a rewrite of `/(.*)` to `/`.
  Cloudflare Pages does this automatically.
- Serve over HTTPS (required for service workers and installing the app).
- Cache headers: `sw.js` and `index.html` should not be cached long-term; `/assets/*` files have
  hashed names and can be cached for a year.
- Optional: send `X-Robots-Tag: noindex` for `/shared/*` to keep shared pages out of search engines.

## Checking it
1. `npm run build && npm run preview`
2. Chrome DevTools > Application: manifest has no warnings, a service worker is active.
3. Network tab > Offline, then reload: the shell and previously viewed catalog pages still open.
4. Lighthouse (mobile): review the Performance, Accessibility and PWA results.
