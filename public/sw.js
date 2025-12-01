// public/sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  return self.clients.claim();
});

// Basic caching (optional, minimal)  
self.addEventListener('fetch', (event) => {
  // Do not cache API or dynamic data  
  if (event.request.url.includes('/api')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() =>
          caches.match('/offline.html')
        )
      );
    })
  );
});
