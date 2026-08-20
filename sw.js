const CACHE_NAME = 'ranel-cell-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  './Gambar/192_V1.png', // Logo baru
  './Gambar/512_V1.png', // Logo baru
  // ... daftar file CSS/JS lokal lainnya jika ada
];

// Saat Service Worker diinstall, simpan file baru ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Paksa langsung aktif tanpa menunggu
  );
});

// Saat Service Worker diaktifkan, HAPUS cache versi lama
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

// Strategi Cache First (Ambil dari cache dulu, jika tidak ada baru ke network)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});