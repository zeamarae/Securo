/**
 * Securo Service Worker v2.0
 * Provides offline support and background sync
 * Date: 2026-10-06
 */

const CACHE_NAME = 'securo-v2.0';
const RUNTIME_CACHE = 'securo-runtime';

// Core assets to cache for offline use
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/role-selection.html',
    '/guardian.html',
    '/guardian-dashboard.html',
    '/admin.html',
    '/admin-login.html',
    '/profile.html',
    '/settings.html',
    '/permissions-onboarding.html',
    '/auth.js',
    '/db.js',
    '/router.js',
    '/utils.js',
    '/firebase-config.js',
    '/logo.png',
    '/manifest.json'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching core assets');
                return cache.addAll(CORE_ASSETS.map(url => new Request(url, {
                    cache: 'reload'
                })));
            })
            .then(() => self.skipWaiting())
            .catch(error => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome extensions
    if (url.protocol === 'chrome-extension:') return;

    // Skip Firebase and external APIs (always need fresh data)
    if (
        url.hostname.includes('firebasestorage.googleapis.com') ||
        url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com') ||
        url.hostname.includes('cdn.jsdelivr.net')
    ) {
        return;
    }

    // For navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache successful navigation responses
                    if (response.ok) {
                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Offline - serve from cache
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Fallback to index.html for SPA routing
                            return caches.match('/index.html');
                        });
                })
        );
        return;
    }

    // For all other requests - network first, cache fallback
    event.respondWith(
        fetch(request)
            .then(response => {
                // Cache successful responses
                if (response.ok) {
                    const responseToCache = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Offline - serve from cache
                return caches.match(request);
            })
    );
});

// Background sync for offline queue
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-offline-queue') {
        event.waitUntil(
            syncOfflineQueue()
        );
    }
});

// Process offline queue
async function syncOfflineQueue() {
    try {
        console.log('[SW] Syncing offline queue...');
        
        // Notify all clients to process queue
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_OFFLINE_QUEUE'
            });
        });
        
        console.log('[SW] Queue sync notification sent');
    } catch (error) {
        console.error('[SW] Queue sync failed:', error);
        throw error;
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Securo Alert';
    const options = {
        body: data.body || 'You have a new notification',
        icon: '/logo.png',
        badge: '/logo.png',
        data: data,
        actions: data.actions || [],
        requireInteraction: data.priority === 'high'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.notification.tag);
    
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/index.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Message handling from clients
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data?.type === 'CACHE_URLS') {
        const urls = event.data.urls || [];
        event.waitUntil(
            caches.open(RUNTIME_CACHE)
                .then(cache => cache.addAll(urls))
        );
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('[SW] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service worker script loaded');
