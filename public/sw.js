const CACHE  = 'fluento-v1'
const ASSETS = [
  '/',
  '/index.html',
]

// Install — cache the app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  )
  self.skipWaiting()
})

// Activate — remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network-first for API calls, cache-first for assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Always go to network for API requests
  if (url.hostname.includes('groq.com') || url.hostname.includes('supabase.co')) {
    e.respondWith(fetch(e.request))
    return
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      // Cache valid same-origin GET responses
      if (res.ok && e.request.method === 'GET' && url.origin === self.location.origin) {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
      }
      return res
    }))
  )
})