const CACHE_NAME = 'ranel-cell-cache-v.0.2.5.3';
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

// PERUBahan UTAMA: Menangani klik notifikasi
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notifData = event.notification.data || {};
    let targetUrl = './index.html';

    // Cek tipe notifikasi untuk menentukan URL tujuan
    if (notifData.type === 'transaction' && notifData.transactionId) {
        targetUrl = `./index.html?action=transaction_detail&id=${notifData.transactionId}`;
    } else if (notifData.type === 'complaint' && notifData.transactionId) {
        targetUrl = `./index.html?action=complaint_detail&id=${notifData.transactionId}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Jika aplikasi PWA sedang terbuka di background
            for (const client of clientList) {
                if (client.url.includes('index.html') && 'focus' in client) {
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
            // Jika aplikasi PWA tertutup (force close), buat jendela baru dengan parameter URL
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});