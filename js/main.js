import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging.js';

const firebaseConfig = {
    apiKey: "AIzaSyAWlxciG0vZSLD78nC2n2qGNOvuzul3rTE",
    authDomain: "pwa-ts-c7c15.firebaseapp.com",
    projectId: "pwa-ts-c7c15",
    storageBucket: "pwa-ts-c7c15.firebasestorage.app",
    messagingSenderId: "438732315703",
    appId: "1:438732315703:web:bcc4ff82c8ce5e4b1f73b2",
    measurementId: "G-7M93B09YP4"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY = "BDSUjXiUoetn8Qz6mmTlIEFL9Mv6Z-CCmuFofvAk1Uit5mn2TV4EMNHze1ei90PA6maIhR-e563M8XD5ffyiItY";
const MESSAGING_SW_PATH = '/pwa-js/firebase-messaging-sw.js';
const MESSAGING_SW_SCOPE = '/pwa-js/';
const MAIN_SW_PATH = '/pwa-js/sw.js';
const MAIN_SW_SCOPE = '/pwa-js/';

let firebaseMessagingSwReg = null;

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register(MAIN_SW_PATH, { scope: MAIN_SW_SCOPE })
            .then(registration => {
                console.log("Main PWA Service Worker registered:", registration);
            })
            .catch(error => {
                console.error("Main PWA Service Worker registration failed:", error);
            });

        navigator.serviceWorker
            .register(MESSAGING_SW_PATH, { scope: MESSAGING_SW_SCOPE })
            .then(registration => {
                console.log("Firebase Messaging SW registered:", registration);
                firebaseMessagingSwReg = registration;
                console.log("Firebase Messaging SW registration stored.");
            })
            .catch(error => {
                console.error("Firebase Messaging SW registration failed:", error);
            });
    });
} else {
    console.error("Service Workers not supported in this browser.");
}

const enableNotificationsButton = document.getElementById("enable-notifications-button");
enableNotificationsButton?.addEventListener("click", requestPermissionAndRetrieveToken);

async function requestPermissionAndRetrieveToken() {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
        console.error("Service Workers or Notifications not supported.");
        return;
    }

    try {
        console.log("Requesting notification permission...");
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("Notification permission granted.");
            retrieveToken();
        } else {
            console.log("Unable to get permission to notify.");
            if (enableNotificationsButton) enableNotificationsButton.textContent = "Permission Denied";
            if (enableNotificationsButton) enableNotificationsButton.disabled = true;
        }
    } catch (error) {
        console.error("Error during permission request or SW check:", error);
    }
}

function retrieveToken() {
    if (!firebaseMessagingSwReg) {
        console.error("Firebase Messaging SW registration not found or not ready yet. Cannot get token.");
        if (enableNotificationsButton) enableNotificationsButton.textContent = "SW Not Ready";
        return;
    }

    console.log("Attempting to get token using specific SW registration:", firebaseMessagingSwReg);

    getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: firebaseMessagingSwReg
    })
        .then(currentToken => {
            if (currentToken) {
                console.log("FCM Token:", currentToken);
                sendTokenToServer(currentToken);
                if (enableNotificationsButton) enableNotificationsButton.textContent = "Notifications Enabled";
                if (enableNotificationsButton) enableNotificationsButton.disabled = true;
            } else {
                console.log("No registration token available. Permission might have been reset or SW issue persists.");
                if (enableNotificationsButton) enableNotificationsButton.textContent = "Enable Notifications";
                if (enableNotificationsButton) enableNotificationsButton.disabled = false;
            }
        })
        .catch(err => {
            console.error("An error occurred while retrieving token: ", err);
            if (enableNotificationsButton) enableNotificationsButton.textContent = "Error Getting Token";
            if (enableNotificationsButton) enableNotificationsButton.disabled = true;
        });
}

function sendTokenToServer(token) {
    console.log("Sending token to server (implementation needed):", token);
}

onMessage(messaging, payload => {
    console.log("Message received while app is in foreground: ", payload);
    const notificationTitle = payload.notification?.title ?? "Foreground Message";
    const notificationOptions = {
        body: payload.notification?.body ?? "You have a message.",
        icon: payload.notification?.icon ?? "/pwa-js/images/icons/icon-192x192.png",
        data: payload.data
    };
    displayInAppNotification(notificationTitle, notificationOptions);
});

function displayInAppNotification(title, options) {
    console.log(`Displaying in-app: ${title} - ${options.body}`);
}