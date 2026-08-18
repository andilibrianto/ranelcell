const CACHE_NAME = 'ranel-cell-cache-v.0.1.3.3';
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

// Saat Service Worker diinstall, daftarkan file ke cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Saa Service Worker diaktifkan, hapus cache versi lama
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName); // Hapus cache lama
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Strategi Cache: Cache First, fallback ke Network
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    // Jangan cache API peta (Nominatim) atau API Vercel Backend
    if (event.request.url.includes('nominatim.openstreetmap.org') || event.request.url.includes('vercel.app')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            // Jika ada di cache, ambil dari cache. Jika tidak, fetch dari internet.
            return response || fetch(event.request).catch(() => caches.match('./index.html'));
        })
    );
});