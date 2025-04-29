importScripts('https://www.gstatic.com/firebasejs/10.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAWlxciG0vZSLD78nC2n2qGNOvuzul3rTE",
    authDomain: "pwa-ts-c7c15.firebaseapp.com",
    projectId: "pwa-ts-c7c15",
    storageBucket: "pwa-ts-c7c15.firebasestorage.app",
    messagingSenderId: "438732315703",
    appId: "1:438732315703:web:bcc4ff82c8ce5e4b1f73b2",
    measurementId: "G-7M93B09YP4"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );

    const notificationTitle = payload.notification?.title ?? 'New Message';
    const notificationOptions = {
        body: payload.notification?.body ?? 'You have a new message.',
        icon: payload.notification?.icon ?? '/images/icons/icon-192x192.png',
        data: payload.data,
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});


self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    console.log('[firebase-messaging-sw.js] Notification click Received.', event);

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                const clientUrl = new URL(client.url);
                if ((clientUrl.pathname === '/' || clientUrl.pathname === '/index.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow('/');
            }
        })
    );
});