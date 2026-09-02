const CACHE_NAME = 'ranel-cell-cache-v.0.2.4.5';
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

    if (event.request.url.includes('nominatim.openstreetmap.org') || event.request.url.includes('vercel.app')) {
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
    const targetUrl = './index.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Jika tidak ada window yang terbuka, buka window baru dengan parameter URL
            if (clientList.length === 0) {
                let urlToOpen = targetUrl;
                if (notifData.type === 'transaction' && notifData.transactionId) {
                    urlToOpen = `${targetUrl}?action=transaction&id=${notifData.transactionId}`;
                } else if (notifData.type === 'complaint' && notifData.transactionId) {
                    urlToOpen = `${targetUrl}?action=complaint&id=${notifData.transactionId}`;
                }
                if (clients.openWindow) return clients.openWindow(urlToOpen);
            }

            // Jika ada window yang sudah terbuka, kirim perintah untuk navigasi
            for (const client of clientList) {
                if (client.url.includes('/') && 'focus' in client) {
                    if (notifData.type === 'transaction' && notifData.transactionId) {
                        client.postMessage({ 
                            type: 'NAVIGATE_TO_TRANSACTION', 
                            transactionId: notifData.transactionId 
                        });
                    } else if (notifData.type === 'complaint' && notifData.transactionId) {
                        client.postMessage({ 
                            type: 'NAVIGATE_TO_COMPLAINT', 
                            transactionId: notifData.transactionId 
                        });
                    }
                    return client.focus();
                }
            }
            
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});