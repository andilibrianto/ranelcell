const CACHE_NAME = 'ranel-cell-cache-v.0.1.7.5'; // NAIKKAN VERSI INI SETIAP KALI GANTI LOGO
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
        }).then(() => self.clients.claim()) // Paksa SW baru langsung mengambil alih
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const requestUrl = new URL(event.request.url);
    
    // 1. Abaikan API peta dan notif
    if (requestUrl.href.includes('nominatim.openstreetmap.org') || requestUrl.href.includes('vercel.app')) {
        return;
    }

    // 2. Strategi Network First khusus untuk Manifest dan Gambar (AGAR LOGO BISA BERUBAH OTOMATIS)
    if (requestUrl.pathname.endsWith('manifest.json') || 
        (requestUrl.pathname.includes('/Gambar/') && requestUrl.pathname.endsWith('.png'))) {
        
        event.respondWith(
            fetch(event.request).then(networkResponse => {
                // Jika berhasil fetch dari network, update cache
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Jika offline, gunakan cache
                return caches.match(event.request);
            })
        );
        return;
    }

    // 3. Strategi Cache First untuk file statis lainnya
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => caches.match('./index.html'));
        })
    );
});