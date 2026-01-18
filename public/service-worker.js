// Service Worker for Wasel PWA
// Provides offline functionality and background sync

const CACHE_NAME = 'wasel-v1';
const CACHE_VERSION = 'v1';
const RUNTIME_CACHE = 'wasel-runtime';
const IMAGE_CACHE = 'wasel-images';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[ServiceWorker] Installation complete');
      self.skipWaiting();
    }).catch((error) => {
      console.error('[ServiceWorker] Installation error:', error);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/') || url.hostname === 'api.example.com') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response or offline page
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Return a custom offline response
            return new Response(
              JSON.stringify({
                status: 'offline',
                message: 'You are offline. Some features are unavailable.'
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'application/json'
                })
              }
            );
          });
        })
    );
    return;
  }

  // Handle image requests
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const clonedResponse = response.clone();
          caches.open(IMAGE_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });

          return response;
        }).catch(() => {
          // Return placeholder image on error
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#e5e7eb" width="100" height="100"/></svg>',
            {
              headers: { 'Content-Type': 'image/svg+xml' }
            }
          );
        });
      })
    );
    return;
  }

  // Network first strategy for HTML documents
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Cache first strategy for other requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const clonedResponse = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, clonedResponse);
        });

        return response;
      }).catch(() => {
        return caches.match(request);
      });
    })
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-trips') {
    event.waitUntil(syncTrips());
  }
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const options = {
    body: event.data.text(),
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'wasel-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Wasel', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Periodic background sync (every 24 hours)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-trips') {
    event.waitUntil(updateTripData());
  }
});

// Helper functions for background sync
async function syncTrips() {
  try {
    const response = await fetch('/api/trips/sync');
    if (response.ok) {
      console.log('[ServiceWorker] Trips synced successfully');
      notifyClients('Trips synced');
    }
  } catch (error) {
    console.error('[ServiceWorker] Trip sync error:', error);
  }
}

async function syncMessages() {
  try {
    const response = await fetch('/api/messages/sync');
    if (response.ok) {
      console.log('[ServiceWorker] Messages synced successfully');
      notifyClients('Messages synced');
    }
  } catch (error) {
    console.error('[ServiceWorker] Message sync error:', error);
  }
}

async function updateTripData() {
  try {
    const response = await fetch('/api/trips/update');
    if (response.ok) {
      console.log('[ServiceWorker] Trip data updated');
    }
  } catch (error) {
    console.error('[ServiceWorker] Trip update error:', error);
  }
}

function notifyClients(message) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: message
      });
    });
  });
}

// Log version
console.log(`[ServiceWorker] Version ${CACHE_VERSION} installed`);
