const CACHE_NAME = 'ranel-cell-cache-v.0.1.7.2';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './Gambar/Logo_Ranel_v2_192.png', // Logo baru
  './Gambar/Logo_Ranel_v2_512.png', // Logo baru
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Paksa langsung aktif tanpa menunggu
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName); // Hapus logo lama dari sistem
          }
        })
      );
    }).then(() => self.clients.claim()) // Ambil alih kontrol halaman secara instan
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
})
// Dengarkan pesan dari script utama untuk langsung mengaktifkan SW baru
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});