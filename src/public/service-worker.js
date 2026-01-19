/**
 * Wassel Service Worker
 * 
 * Handles offline functionality, caching, and push notifications
 */

const CACHE_NAME = 'wassel-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const title = data.title || 'Wassel';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    image: data.image,
    vibrate: [200, 100, 200],
    tag: data.tag || 'wassel-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Handle action clicks
  if (event.action) {
    console.log('Action clicked:', event.action);
    
    // Handle different actions
    switch (event.action) {
      case 'view-trip':
        event.waitUntil(
          clients.openWindow(`/trip/${event.notification.data.tripId}`)
        );
        break;
      case 'call-driver':
        // Handle call action
        break;
      default:
        break;
    }
  } else {
    // No action, open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it
          for (let client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Otherwise, open a new window
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Background sync event (for offline trip booking)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);

  if (event.tag === 'sync-trips') {
    event.waitUntil(syncTrips());
  }
});

async function syncTrips() {
  try {
    // Get pending trips from IndexedDB
    const pendingTrips = await getPendingTrips();
    
    // Get CSRF token from storage or generate one
    const csrfToken = await getCSRFToken();
    
    // Send each trip to server with proper security headers
    for (const trip of pendingTrips) {
      // Validate trip data before sending
      if (!isValidTripData(trip)) {
        console.warn('Invalid trip data, skipping:', trip);
        continue;
      }
      
      await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify(trip),
      });
    }
    
    // Clear pending trips
    await clearPendingTrips();
    
    console.log('Trips synced successfully');
  } catch (error) {
    console.error('Sync failed:', error);
    throw error; // Will retry sync
  }
}

// Helper functions for IndexedDB operations
const DB_NAME = 'wassel-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-trips';

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getPendingTrips() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get pending trips:', error);
    return [];
  }
}

async function clearPendingTrips() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to clear pending trips:', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-trips') {
    event.waitUntil(updateTrips());
  }
});

async function updateTrips() {
  try {
    // Fetch latest trip updates with proper security headers
    const response = await fetch('/api/trips/updates', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    });
    
    // Validate response
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Invalid response from server');
    }
    
    const updates = await response.json();
    
    // Validate updates data
    if (!isValidUpdatesData(updates)) {
      throw new Error('Invalid updates data received');
    }
    
    // Update cache
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/api/trips/updates', new Response(JSON.stringify(updates)));
    
    // Notify clients of updates
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'TRIPS_UPDATED',
        data: updates,
      });
    });
  } catch (error) {
    console.error('Update failed:', error);
  }
}

// Message event (for client-to-sw communication)
self.addEventListener('message', (event) => {
  console.log('Message received:', event.data);

  // Validate message origin
  if (!isValidOrigin(event.origin)) {
    console.warn('Invalid origin for message:', event.origin);
    return;
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    // Validate URLs before caching
    const validUrls = event.data.urls?.filter(url => isValidCacheUrl(url)) || [];
    
    if (validUrls.length > 0) {
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.addAll(validUrls);
        })
      );
    }
  }
});

// Security helper functions
async function getCSRFToken() {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'same-origin',
    });
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    return null;
  }
}

function isValidTripData(trip) {
  return trip && 
    typeof trip === 'object' &&
    trip.pickup &&
    trip.destination &&
    typeof trip.pickup.lat === 'number' &&
    typeof trip.pickup.lng === 'number' &&
    typeof trip.destination.lat === 'number' &&
    typeof trip.destination.lng === 'number';
}

function isValidUpdatesData(updates) {
  return Array.isArray(updates) && 
    updates.every(update => 
      update && 
      typeof update === 'object' &&
      update.id &&
      update.status
    );
}

function isValidOrigin(origin) {
  const allowedOrigins = [
    self.location.origin,
    'https://wassel.com',
    'https://app.wassel.com'
  ];
  return allowedOrigins.includes(origin);
}

function isValidCacheUrl(url) {
  try {
    const urlObj = new URL(url, self.location.origin);
    return urlObj.origin === self.location.origin &&
           !url.includes('../') &&
           !url.includes('..\\');
  } catch (error) {
    return false;
  }
}

console.log('Service Worker loaded successfully');
