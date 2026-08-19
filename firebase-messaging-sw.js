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

// Tangani notifikasi saat aplikasi tertutup (Background)
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || '🔔 RANEL CELL';
    const notificationOptions = {
        body: payload.notification?.body || 'Pesan baru masuk!',
        icon: './Gambar/Logo_BL_intuls_NoBCKG.png',
        badge: './Gambar/Logo_BL_intuls_NoBCKG.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Tangani klik notifikasi (Buka aplikasi)
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('./index.html');
        })
    );
});