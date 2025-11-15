// StillGPT Service Worker
// Provides offline functionality and efficient caching for the AI chat PWA
// Adapted from Digita's service worker pattern with modifications for StillGPT's needs

const CACHE_NAME = 'StillGPTCache-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

// Install event - cache essential files for offline access
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE)
          .catch(err => {
            console.warn('Cache addAll failed:', err);
            // Continue even if some files fail to cache
          });
      })
  );
  // Force new service worker to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      
      if (cachedResponse) {
        // Return cached version immediately
        return cachedResponse;
      }

      try {
        // Attempt to fetch from network
        const networkResponse = await fetch(event.request);
        
        if (networkResponse && networkResponse.status === 200) {
          // Cache successful responses (but not for external CDNs with licensing)
          const shouldCache = !event.request.url.includes('cdn.jsdelivr.net') || 
                            event.request.url.includes('transformers');
          
          if (shouldCache) {
            cache.put(event.request, networkResponse.clone());
          }
        }
        
        return networkResponse;
      } catch (err) {
        console.error('Fetch failed:', err);
        // Return cached version if available, otherwise fail gracefully
        return cachedResponse || new Response('Offline - Content not available', { status: 503 });
      }
    })
  );
});

// Message handler - allows manual cache updates from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.keys().then((requests) => {
        requests.forEach((request) => {
          // Update all cached files
          fetch(request)
            .then(response => {
              if (response && response.status === 200) {
                cache.put(request, response);
              }
            })
            .catch(err => {
              console.error(`Failed to update ${request.url}:`, err);
            });
        });
      });
    });
    // Notify the client that update is complete
    event.ports[0].postMessage({ status: 'Cache update initiated' });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ status: 'Cache cleared' });
    });
  }
});

// Background sync (optional - for future features)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-chat-data') {
    event.waitUntil(
      // Future: sync chat data with server
      Promise.resolve()
    );
  }
});
