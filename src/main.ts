import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";
import { FirebaseOptions } from "@firebase/app-types";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAWlxciG0vZSLD78nC2n2qGNOvuzul3rTE",
  authDomain: "pwa-ts-c7c15.firebaseapp.com",
  projectId: "pwa-ts-c7c15",
  storageBucket: "pwa-ts-c7c15.firebasestorage.app",
  messagingSenderId: "438732315703",
  appId: "1:438732315703:web:bcc4ff82c8ce5e4b1f73b2",
  measurementId: "G-7M93B09YP4",
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const messaging: Messaging = getMessaging(app);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration: ServiceWorkerRegistration) => {
        console.log(
          "Main PWA Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error: any) => {
        console.error("Main PWA Service Worker registration failed:", error);
      });
  });
}

function requestNotificationPermission(): void {
  console.log("Requesting notification permission...");
  Notification.requestPermission().then(
    (permission: NotificationPermission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
        retrieveToken();
      } else {
        console.log("Unable to get permission to notify.");
      }
    }
  );
}

const enableNotificationsButton = document.getElementById(
  "enable-notifications-button"
);
enableNotificationsButton?.addEventListener(
  "click",
  requestNotificationPermission
);

const VAPID_KEY =
  "BDSUjXiUoetn8Qz6mmTlIEFL9Mv6Z-CCmuFofvAk1Uit5mn2TV4EMNHze1ei90PA6maIhR-e563M8XD5ffyiItY";

function retrieveToken(): void {
  getToken(messaging, { vapidKey: VAPID_KEY })
    .then((currentToken: string | null) => {
      if (currentToken) {
        console.log("FCM Token:", currentToken);
        sendTokenToServer(currentToken);
      } else {
        console.log(
          "No registration token available. Request permission to generate one."
        );
        // Might need to call requestNotificationPermission() again or guide the user
      }
    })
    .catch((err: unknown) => {
      console.error("An error occurred while retrieving token. ", err);
      // Handle specific errors if needed (e.g., messaging/permission-blocked)
    });
}

function sendTokenToServer(token: string): void {
  console.log("Sending token to server (implementation needed):", token);
  // Replace with your actual fetch or axios call to your backend API
  /*
  fetch('/api/save-fcm-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ token }), // Send token, associate with user server-side
  })
  .then(response => response.json())
  .then(data => console.log('Token save response:', data))
  .catch(error => console.error('Error saving token:', error));
  */
}

// Optional: Check permission on load
/*
if (typeof Notification !== 'undefined') { // Check if Notification API exists
  if (Notification.permission === 'granted') {
      retrieveToken();
  } else if (Notification.permission === 'default') {
      console.log('Notification permission not yet requested.');
      // You might show the button to request permission here
      // Or call requestNotificationPermission() based on some logic
  } else {
      console.log('Notification permission was denied.');
      // Update UI to reflect denied state
  }
}
*/
// src/main.ts
import { MessagePayload } from "firebase/messaging"; // Import the type

onMessage(messaging, (payload: MessagePayload) => {
  console.log("Message received while app is in foreground: ", payload);

  const notificationTitle = payload.notification?.title ?? "Foreground Message";
  const notificationOptions: NotificationOptions = {
    body: payload.notification?.body ?? "You have a message.",
    icon: payload.notification?.icon ?? "/images/icons/icon-192x192.png",
    data: payload.data,
  };

  // Option 1: Show using Notification API (acts like a system notification)
  // new Notification(notificationTitle, notificationOptions);

  // Option 2: Update UI directly (e.g., show an in-app banner/toast)
  displayInAppNotification(notificationTitle, notificationOptions);
});

function displayInAppNotification(
  title: string,
  options: NotificationOptions
): void {
  console.log(`Displaying in-app: ${title} - ${options.body}`);
  // Implement your UI logic here, e.g.:
  // const notificationElement = document.getElementById('in-app-notification');
  // if (notificationElement) {
  //    notificationElement.querySelector('.title').textContent = title;
  //    notificationElement.querySelector('.body').textContent = options.body;
  //    notificationElement.style.display = 'block';
  //    setTimeout(() => { notificationElement.style.display = 'none'; }, 5000);
  // }
}
