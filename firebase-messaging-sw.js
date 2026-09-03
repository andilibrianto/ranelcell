importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDmDyI5olQ2a0zaxLIASH3EglRfsAmE7-Q",
    authDomain: "ranel-cell.firebaseapp.com",
    projectId: "ranel-cell",
    storageBucket: "ranel-cell.firebasestorage.app",
    messagingSenderId: "267696476787",
    appId: "1:267696476787:web:5fda181cfdaeec413e5006"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Aktifkan kontrol langsung ke client
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// Handler untuk pesan FCM data-only (tanpa notification payload)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message:', payload);
    const title = payload.notification?.title || payload.data?.title || 'RANEL CELL';
    const body = payload.notification?.body || payload.data?.body || 'Pesan baru masuk';
    const notifType = payload.data?.type || 'transaction';
    const transactionId = payload.data?.transactionId || payload.data?.orderId || '';

    const options = {
        body: body,
        icon: './Gambar/PWA_512_M.png',
        badge: './Gambar/PWA_512_M.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: notifType + '_' + transactionId,
        data: {
            type: notifType,
            transactionId: transactionId
        }
    };
    return self.registration.showNotification(title, options);
});

// ==========================================================
// NOTIFICATION CLICK HANDLER (FCM + Local Notifications)
// ==========================================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notifData = event.notification.data || {};
    const txId = notifData.transactionId || '';
    const notifType = notifData.type || '';

    const targetUrl = './index.html?action=notif&type=' + encodeURIComponent(notifType) + '&id=' + encodeURIComponent(txId);

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
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
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});