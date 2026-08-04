const CACHE_NAME = 'ranel-cell-v.0.0.0.7.8';
self.addEventListener('install', function(e) {
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(e) {
    // Jangan cache API waktu, peta, dan script Firebase
    if (e.request.url.includes('timeapi.io') || 
        e.request.url.includes('nominatim.openstreetmap.org') || 
        e.request.url.includes('gstatic.com') || 
        e.request.url.includes('firebaseio.com')) {
        return; 
    }
    
    e.respondWith(
        caches.match(e.request).then(function(r) {
            return r || fetch(e.request).then(function(res) {
                if (res.status === 200 && res.type === 'basic') {
                    var c = res.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, c);
                    });
                }
                return res;
            }).catch(function() {
                return new Response('Offline', {status: 503});
            });
        })
    );
});
