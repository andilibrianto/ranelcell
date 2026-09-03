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

// Tangani klik notifikasi dari Firebase
self.addEventListener('notificationclick', event => {
    event.notification.close();

    const notifData = event.notification.data || {};
    let targetUrl = './index.html';

    if (notifData.type === 'transaction' && notifData.transactionId) {
        targetUrl = `./index.html?action=transaction_detail&id=${notifData.transactionId}`;
    } else if (notifData.type === 'complaint' && notifData.transactionId) {
        targetUrl = `./index.html?action=complaint_detail&id=${notifData.transactionId}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes('index.html') && 'focus' in client) {
                    if (notifData.type === 'transaction' && notifData.transactionId) {
                        client.postMessage({ 
                            type: 'NAVIGATE_TO_TRANSACTION', 
                            transactionId: notifData.transactionId 
                        });
                    } else if (notifData.type === 'complaint' && notifData.transactionId) {
                        client.postMessage({ 
                            type: 'NAVIGATE_TO_COMPLAINT', 
                            transactionId: notifData.transactionId 
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