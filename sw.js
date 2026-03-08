const CACHE = 'alert-v2';
const ASSETS = ['/','index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Background sync for price checking
self.addEventListener('periodicsync', e => {
  if(e.tag === 'check-prices') {
    e.waitUntil(checkPricesInBackground());
  }
});

async function checkPricesInBackground() {
  try {
    const clients = await self.clients.matchAll();
    if(clients.length > 0) return; // App is open, let it handle
    // Could implement background fetch here if needed
  } catch {}
}

self.addEventListener('push', e => {
  if(!e.data) return;
  const d = e.data.json();
  e.waitUntil(
    self.registration.showNotification(d.title, {
      body: d.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      vibrate: [200,100,200,100,400],
      data: d.data
    })
  );
});
