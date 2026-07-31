// 1. Import SDK OneSignal (Wajib ada di baris pertama)
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

// 2. Kode Service Worker PWA Anda (digabung agar tidak bentrok)
const CACHE_NAME = 'ranel-cell-cache-v6'; 
self.addEventListener('install',function(e){self.skipWaiting();});

self.addEventListener('activate',function(e){
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

self.addEventListener('fetch',function(e){
    if (e.request.url.includes('timeapi.io') || e.request.url.includes('nominatim.openstreetmap.org')) {
        return; 
    }
    e.respondWith(caches.match(e.request).then(function(r){
        return r||fetch(e.request).then(function(res){
            if(res.status===200&&res.type==='basic'){
                var c=res.clone();
                caches.open(CACHE_NAME).then(function(cache){cache.put(e.request,c);});
            }
            return res;
        }).catch(function(){
            return new Response('Offline',{status:503});
        });
    }));
});