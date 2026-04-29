const CACHE_NAME = 'bloodlink-pwa-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`[PWA] Failed to cache ${url}:`, err);
            });
          })
        );
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Network first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  // Ignore API requests for caching
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache valid http responses
        if (!response || response.status !== 200) {
          return response;
        }
        if (response.type === 'opaque') {
          return response;
        }
        
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(response => {
          if (response) {
             return response;
          }
          // If viewing a page that is not cached, return the root index.html block it as SPA fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  const urlToOpen = e.notification.data?.url || '/';
  
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
