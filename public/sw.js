const CACHE_NAME = 'growhub-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GrowHub - Hors ligne</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e5e5e5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .container { text-align: center; padding: 2rem; }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
    p { color: #888; font-size: 0.875rem; margin-bottom: 1.5rem; }
    button { background: #4ade80; color: #0a0a0a; border: none; padding: 0.75rem 2rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.875rem; cursor: pointer; }
    button:hover { background: #22c55e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>Vous êtes hors ligne</h1>
    <p>Vérifiez votre connexion internet et réessayez.</p>
    <button onclick="window.location.reload()">Réessayer</button>
  </div>
</body>
</html>
`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(STATIC_ASSETS);
      // Cache offline page
      const offlineResponse = new Response(OFFLINE_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
      await cache.put('/offline.html', offlineResponse);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip API calls - network only
  if (url.pathname.includes('/rest/') || url.pathname.includes('/auth/') || url.pathname.includes('/functions/') || url.hostname.includes('supabase')) {
    return;
  }

  // For navigation requests (HTML pages) - network first, fallback to cache, then offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // For static assets - stale while revalidate
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff2|woff|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetching = fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        }).catch(() => cached);

        return cached || fetching;
      })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notification support
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'GrowHub', {
        body: data.body || '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: data.url ? { url: data.url } : undefined,
      })
    );
  } catch (e) {
    // Ignore malformed push data
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
