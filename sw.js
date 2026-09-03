const CACHE_NAME = 'ranel-cell-cache-v.0.2.5.2';
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
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
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
        }).then(() => self.clients.claim())
    );
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

// ==========================================================
// NOTIFICATION CLICK HANDLER (Versi Lengkap & Terverifikasi)
// ==========================================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notifData = event.notification.data || {};
    const txId = notifData.transactionId || '';
    const notifType = notifData.type || '';

    // URL fallback untuk cold-start (PWA tertutup total)
    const targetUrl = './index.html?action=notif&type=' + encodeURIComponent(notifType) + '&id=' + encodeURIComponent(txId);

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Prioritas 1: Cari window PWA yang sudah terbuka
            for (const client of clientList) {
                // Pastikan ini window milik PWA kita (same-origin)
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    if (notifType && txId) {
                        client.postMessage({
                            type: notifType === 'complaint' ? 'NAVIGATE_TO_COMPLAINT' : 'NAVIGATE_TO_TRANSACTION',
                            transactionId: txId,
                            notifType: notifType
                        });
                    }
                    return client.focus();
                }
            }
            // Prioritas 2: Tidak ada window → buka window baru dengan URL params
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});