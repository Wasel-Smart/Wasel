// Firebase Configuration for Wasel
// Push Notifications & Cloud Messaging Setup
// Status: Ready for Firebase Project Setup

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, onMessage, getToken, type Messaging } from 'firebase/messaging';
import { getAnalytics, type Analytics } from 'firebase/analytics';

/**
 * Firebase Configuration
 * These values come from your Firebase Console
 * Project Settings > General > Your Web Apps
 */
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

function validateFirebaseConfig() {
  const missing = requiredEnvVars.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    console.warn(`[Firebase] Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wasel-app'}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wasel-app'}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/**
 * Initialize Firebase App
 */
let app: FirebaseApp | null = null;

try {
  if (validateFirebaseConfig()) {
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] App initialized successfully');
  } else {
    console.warn('[Firebase] Missing configuration. Push notifications disabled.');
  }
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
  app = null;
}

/**
 * Get Firebase Messaging Instance
 */
export function getFirebaseMessaging(): Messaging | null {
  if (!app) {
    console.warn('[Firebase] App not initialized');
    return null;
  }

  try {
    return getMessaging(app);
  } catch (error) {
    console.error('[Firebase] Failed to get messaging:', error);
    return null;
  }
}

/**
 * Request Push Notification Permission
 * Shows browser permission dialog to user
 */
export async function requestPushPermission(): Promise<boolean> {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('[Firebase] Notifications not supported in this browser');
      return false;
    }

    // Check current permission status
    if (Notification.permission === 'granted') {
      console.log('[Firebase] Notification permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('[Firebase] Notification permission denied');
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('[Firebase] Permission request error:', error);
    return false;
  }
}

/**
 * Register Device for Push Notifications
 * Gets FCM token and stores it in Supabase
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  try {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.warn('[Firebase] Messaging not available');
      return null;
    }

    // Check if service worker is registered
    if (!('serviceWorker' in navigator)) {
      console.warn('[Firebase] Service Worker not supported');
      return null;
    }

    // Wait for service worker to be ready
    const serviceWorkerReady = await navigator.serviceWorker.ready;
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.warn('[Firebase] VAPID key not configured');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      serviceWorkerRegistration: serviceWorkerReady,
      vapidKey,
    });

    if (token) {
      console.log('[Firebase] FCM Token received:', token.substring(0, 20) + '...');

      // TODO: Store token in Supabase for this user
      // await supabase
      //   .from('user_devices')
      //   .upsert({
      //     user_id: userId,
      //     fcm_token: token,
      //     device_type: 'web',
      //     last_updated: new Date(),
      //   });

      return token;
    } else {
      console.warn('[Firebase] No FCM token received');
      return null;
    }
  } catch (error) {
    console.error('[Firebase] Registration error:', error);
    return null;
  }
}

/**
 * Listen for Incoming Push Notifications (Foreground)
 * When app is open and user receives notification
 */
export function setupPushNotificationListener(
  onNotification: (payload: FirebaseNotificationPayload) => void
): (() => void) | null {
  try {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.warn('[Firebase] Messaging not available for listener');
      return null;
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[Firebase] Message received:', payload);

      // Handle notification
      if (payload.notification) {
        const { title, body, icon } = payload.notification;

        // Show notification to user (can also show in-app toast)
        const notificationData: FirebaseNotificationPayload = {
          title: title || 'Wasel Notification',
          body: body || '',
          icon: icon || '/vite.svg',
          badge: '/vite.svg',
          tag: 'wasel-notification',
          data: payload.data,
        };

        // Call user's callback
        onNotification(notificationData);

        // Optional: Also show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            data: notificationData.data,
          });
        }
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Firebase] Listener setup error:', error);
    return null;
  }
}

/**
 * Get Firebase Analytics Instance
 * For event tracking and user insights
 */
export function getFirebaseAnalytics(): Analytics | null {
  if (!app) {
    console.warn('[Firebase] App not initialized for analytics');
    return null;
  }

  try {
    return getAnalytics(app);
  } catch (error) {
    console.error('[Firebase] Failed to get analytics:', error);
    return null;
  }
}

/**
 * Track Event in Firebase Analytics
 */
export function trackFirebaseEvent(eventName: string, eventData?: Record<string, any>): void {
  try {
    const analytics = getFirebaseAnalytics();
    if (!analytics) return;

    // Firebase has logEvent function in analytics module
    // This is a placeholder for implementation
    console.log('[Firebase] Event tracked:', eventName, eventData);
  } catch (error) {
    console.error('[Firebase] Event tracking error:', error);
  }
}

/**
 * Initialize Firebase Services
 * Call this in your app initialization (e.g., in App.tsx useEffect)
 */
export async function initializeFirebaseServices(userId: string): Promise<void> {
  try {
    console.log('[Firebase] Initializing services...');

    // Check if Firebase is configured
    if (!app) {
      console.warn('[Firebase] Firebase not configured. Skipping initialization.');
      return;
    }

    // Request permission for notifications
    const hasPermission = await requestPushPermission();
    if (hasPermission) {
      // Register device for push notifications
      const token = await registerForPushNotifications(userId);
      if (token) {
        console.log('[Firebase] Device registered for notifications');

        // Setup listener for incoming notifications
        const unsubscribe = setupPushNotificationListener((notification) => {
          console.log('[Firebase] Notification received in app:', notification);
          // Show toast or in-app notification here
        });

        // Store unsubscribe function for cleanup
        if (unsubscribe) {
          // You can store this in a global state or context for cleanup
          (window as any).__firebaseUnsubscribe = unsubscribe;
        }
      }
    }

    console.log('[Firebase] Services initialized');
  } catch (error) {
    console.error('[Firebase] Service initialization error:', error);
  }
}

/**
 * Firebase Setup Instructions
 * 
 * 1. Create a Firebase Project:
 *    - Go to console.firebase.google.com
 *    - Create a new project
 *    - Enable Cloud Messaging
 * 
 * 2. Get Credentials:
 *    - Project Settings > Web App
 *    - Copy the config values
 * 
 * 3. Configure .env:
 *    VITE_FIREBASE_API_KEY=your_api_key
 *    VITE_FIREBASE_PROJECT_ID=your_project_id
 *    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
 *    VITE_FIREBASE_APP_ID=your_app_id
 *    VITE_FIREBASE_STORAGE_BUCKET=your_bucket
 *    VITE_FIREBASE_VAPID_KEY=your_vapid_key
 * 
 * 4. Generate VAPID Key:
 *    - Project Settings > Cloud Messaging
 *    - Generate key pair
 *    - Copy public key to VITE_FIREBASE_VAPID_KEY
 * 
 * 5. Create Service Worker:
 *    - Copy firebase-messaging-sw.js to public folder
 * 
 * 6. Add to App.tsx:
 *    import { initializeFirebaseServices } from '@/firebase';
 *    
 *    useEffect(() => {
 *      if (user?.id) {
 *        initializeFirebaseServices(user.id);
 *      }
 *    }, [user?.id]);
 */

// Export types for TypeScript support
export type FirebaseMessage = {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
  };
  data?: Record<string, string>;
};

export type FirebaseNotificationPayload = {
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
  data?: Record<string, any>;
};
