const CACHE_NAME = 'ranel-cell-cache-v.0.2.5.0';
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
    const fcmMsg = notifData.FCM_MSG || {};
    const payloadData = fcmMsg.data || (notifData.payload && notifData.payload.data) || {};
    
    const transactionId = notifData.transactionId || payloadData.transactionId || payloadData.id || null;
    const actionType = notifData.type || payloadData.type || 'transaction';

    const targetUrl = './index.html';
    let urlToOpen = targetUrl;

    if (transactionId) {
        urlToOpen = `${targetUrl}?action=${actionType}&id=${transactionId}`;
    }

    event.waitUntil(
        (async () => {
            // SIMPAN ID KE CACHE AGAR TIDAK HILANG JIKA URL PARAMETER DIABAIKAN PWA
            if (transactionId) {
                const cache = await caches.open('notif-data');
                const response = new Response(JSON.stringify({ transactionId: transactionId }));
                await cache.put('./pending-notif', response);
            }

            const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
            
            // Jika ada window yang sudah terbuka (Background)
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus().then(() => {
                        // KIRIM PESAN SETELAH FOCUS BERHASIL
                        if (transactionId) {
                            client.postMessage({ 
                                type: actionType === 'complaint' ? 'NAVIGATE_TO_COMPLAINT' : 'NAVIGATE_TO_TRANSACTION', 
                                transactionId: transactionId 
                            });
                        }
                    });
                }
            }
            
            // Jika tidak ada window yang terbuka (Force Close)
            if (clients.openWindow) return clients.openWindow(urlToOpen);
        })()
    );
});