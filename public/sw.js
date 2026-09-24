const CACHE_NAME = 'workout-shell-v1'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/img/logo.png', '/img/bg%20main.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin || event.request.method !== 'GET') return
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone()
    void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
    return response
  }).catch(() => caches.match('/index.html'))))
})
