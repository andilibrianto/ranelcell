const CACHE_NAME = 'ranel-cell-cache-v.0.2.8.4';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Jangan intercept API calls
    if (url.hostname.includes('nominatim.openstreetmap.org') || 
        url.hostname.includes('vercel.app') ||
        url.hostname.includes('timeapi.io') ||
        url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('fcm.googleapis.com')) {
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const cloned = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
                    return response;
                })
                .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => caches.match('./index.html'));
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notifData = event.notification.data || {};
    const targetUrl = '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes('/') && 'focus' in client) {
                    if (notifData.type === 'complaint' && notifData.transactionId) {
                        client.postMessage({ 
                            type: 'NAVIGATE_TO_COMPLAINT', 
                            transactionId: notifData.transactionId 
                        });
                    } else if (notifData.type === 'transaction' && notifData.transactionId) {
                        client.postMessage({ 
                            type: 'NAVIGATE_TO_TRANSACTION', 
                            transactionId: notifData.transactionId 
                        });
                    }
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});