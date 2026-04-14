const CACHE_NAME = 'proscore-shell-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Import Firebase Messaging SW logic
importScripts('/firebase-messaging-sw.js');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy: Network Only for API requests to ensure fresh match data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Strategy: Cache First, Fallback to Network for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        // Optionally cache new static assets on the fly
        if (event.request.method === 'GET' && fetchRes.status === 200) {
            const cacheRes = fetchRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheRes));
        }
        return fetchRes;
      });
    }).catch(() => {
        // If both fail and it's a navigation request, return cached index.html
        if (event.request.mode === 'navigate') {
            return caches.match('/');
        }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus().then(c => {
          if (event.notification.data && event.notification.data.matchId) {
            c.postMessage({ type: 'openMatch', matchId: event.notification.data.matchId });
          }
        });
      }
      return clients.openWindow('/').then(c => {
          if (event.notification.data && event.notification.data.matchId) {
            setTimeout(() => {
                c.postMessage({ type: 'openMatch', matchId: event.notification.data.matchId });
            }, 2000);
          }
      });
    })
  );
});
