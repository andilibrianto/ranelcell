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

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    // Ambil data dari notifikasi (support untuk payload FCM dan notifikasi lokal)
    const notifData = event.notification.data || {};
    const fcmMsg = notifData.FCM_MSG || {};
    const payloadData = fcmMsg.data || (notifData.payload && notifData.payload.data) || {};
    
    let transactionId = notifData.transactionId || payloadData.transactionId || payloadData.id || null;
    let actionType = notifData.type || payloadData.type || 'transaction';

    const targetUrl = './index.html';
    let urlToOpen = targetUrl;

    if (transactionId) {
        urlToOpen = `${targetUrl}?action=${actionType}&id=${transactionId}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Jika aplikasi sedang berjalan di background
            for (const client of clientList) {
                if ('focus' in client) {
                    if (transactionId) {
                        client.postMessage({ 
                            type: actionType === 'complaint' ? 'NAVIGATE_TO_COMPLAINT' : 'NAVIGATE_TO_TRANSACTION', 
                            transactionId: transactionId 
                        });
                    }
                    return client.focus();
                }
            }
            
            // Jika tidak ada aplikasi yang terbuka
            if (clients.openWindow) return clients.openWindow(urlToOpen);
        })
    );
});