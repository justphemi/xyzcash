// Minimal placeholder Service-Worker for Vercel/v0 preview.
// It immediately takes control and does no runtime caching.

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", () => {
  self.clients.claim()
})
