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

    // Data Firebase seringkali bersarang di dalam .data
    let transId = notifData.transactionId || (notifData.data ? notifData.data.transactionId : null);
    let type = notifData.type || (notifData.data ? notifData.data.type : null);

    if (type === 'transaction' && transId) {
        targetUrl = `./index.html?action=transaction_detail&id=${transId}`;
    } else if (type === 'complaint' && transId) {
        targetUrl = `./index.html?action=complaint_detail&id=${transId}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes('index.html') && 'focus' in client) {
                    if (type === 'transaction' && transId) {
                        client.postMessage({ 
                            type: 'NAVIGATE_TO_TRANSACTION', 
                            transactionId: transId 
                        });
                    } else if (type === 'complaint' && transId) {
                        client.postMessage({ 
                            type: 'NAVIGATE_TO_COMPLAINT', 
                            transactionId: transId 
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