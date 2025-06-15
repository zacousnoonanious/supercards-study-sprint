
const CACHE_NAME = 'supercards-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
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
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Try network request
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache successful responses for static assets
            if (event.request.url.includes('/assets/') || 
                event.request.url.includes('.js') || 
                event.request.url.includes('.css')) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Background sync for offline study data
self.addEventListener('sync', (event) => {
  if (event.tag === 'study-sync') {
    event.waitUntil(syncStudyData());
  }
});

async function syncStudyData() {
  try {
    const studyData = await getOfflineStudyData();
    if (studyData.length > 0) {
      // Send to backend when online
      await fetch('/api/sync-study-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studyData)
      });
      // Clear offline data after successful sync
      await clearOfflineStudyData();
    }
  } catch (error) {
    console.error('Failed to sync study data:', error);
  }
}

async function getOfflineStudyData() {
  // This would get data from IndexedDB
  return [];
}

async function clearOfflineStudyData() {
  // This would clear synced data from IndexedDB
}
