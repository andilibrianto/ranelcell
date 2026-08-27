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

// Tangkap klik notifikasi (baik dari FCM maupun Notifikasi Lokal)
self.addEventListener('notificationclick', event => {
    event.notification.close();

    const notifData = event.notification.data || {};
    const tid = notifData.transactionId || '';
    
    // Buat URL target berdasarkan ID Transaksi
    let targetUrl = './';
    if (tid) {
        targetUrl = `./index.html?tid=${tid}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes('/') && 'focus' in client) {
                    client.focus();
                    if (tid) {
                        // Kirim sinyal ke aplikasi jika sedang terbuka di background
                        client.postMessage({ 
                            type: 'NAVIGATE_TO_DETAIL', 
                            transactionId: tid 
                        });
                    }
                    return;
                }
            }
            // Buka aplikasi baru jika sedang tertutup total
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});