"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const sw_1 = require("firebase/messaging/sw");
const firebaseConfig = {
    apiKey: "AIzaSyAWlxciG0vZSLD78nC2n2qGNOvuzul3rTE",
    authDomain: "pwa-ts-c7c15.firebaseapp.com",
    projectId: "pwa-ts-c7c15",
    storageBucket: "pwa-ts-c7c15.firebasestorage.app",
    messagingSenderId: "438732315703",
    appId: "1:438732315703:web:bcc4ff82c8ce5e4b1f73b2",
    measurementId: "G-7M93B09YP4",
};
(0, app_1.initializeApp)(firebaseConfig);
const messaging = (0, sw_1.getMessaging)();
(0, sw_1.onBackgroundMessage)(messaging, (payload) => {
    console.log("[firebase-messaging-sw.js] Received background message ", payload);
    const notificationTitle = payload.notification?.title ?? "New Message";
    const notificationOptions = {
        body: payload.notification?.body ?? "You have a new message.",
        icon: payload.notification?.icon ?? "/images/icons/icon-192x192.png",
        data: payload.data,
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    console.log("[firebase-messaging-sw.js] Notification click Received.", event);
    event.waitUntil(self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
        for (const client of clientList) {
            const clientUrl = new URL(client.url);
            if (clientUrl.pathname === "/" && "focus" in client) {
                return client.focus();
            }
        }
        if (self.clients.openWindow) {
            return self.clients.openWindow("/");
        }
    }));
});
