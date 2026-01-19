// Firebase Cloud Messaging Service Worker
// Handles push notifications when app is in background

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration (same as in firebase.ts)
// Note: This is a public config, so it's safe to include here
const firebaseConfig = {
  apiKey: 'your_api_key',
  authDomain: 'your_project_id.firebaseapp.com',
  projectId: 'your_project_id',
  storageBucket: 'your_bucket',
  messagingSenderId: 'your_sender_id',
  appId: 'your_app_id',
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Wasel Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: payload.notification?.icon || '/vite.svg',
    badge: '/vite.svg',
    tag: 'wasel-notification',
    data: payload.data || {},
    requireInteraction: false,
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM] Notification clicked:', event.notification.tag);

  event.notification.close();

  // Get the URL from notification data or default to root
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[FCM] Notification closed:', event.notification.tag);
});

console.log('[FCM] Firebase Messaging Service Worker loaded');
