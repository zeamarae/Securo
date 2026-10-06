/**
 * Service Worker Installation & Management
 * Date: 2026-10-06
 */

import { Logger, UI, Network } from './utils.js';

let swRegistration = null;
let isOnline = navigator.onLine;

/**
 * Register service worker
 */
export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        Logger.warn('ServiceWorker', 'Service workers not supported');
        return null;
    }

    try {
        swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        });

        Logger.info('ServiceWorker', 'Registered successfully', {
            scope: swRegistration.scope
        });

        // Check for updates
        swRegistration.addEventListener('updatefound', () => {
            const newWorker = swRegistration.installing;
            Logger.info('ServiceWorker', 'Update found');

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available
                    showUpdateNotification();
                }
            });
        });

        return swRegistration;
    } catch (error) {
        Logger.error('ServiceWorker', 'Registration failed', error);
        return null;
    }
}

/**
 * Show update notification
 */
function showUpdateNotification() {
    UI.showModal(
        'Update Available',
        'A new version of Securo is available. Reload to update?',
        {
            type: 'info',
            showCancel: true,
            confirmText: 'Reload Now'
        }
    ).then(confirmed => {
        if (confirmed) {
            window.location.reload();
        }
    });
}

/**
 * Check if service worker is ready
 */
export function isServiceWorkerReady() {
    return swRegistration && swRegistration.active;
}

/**
 * Request background sync
 */
export async function requestBackgroundSync(tag = 'sync-offline-queue') {
    if (!swRegistration || !('sync' in swRegistration)) {
        Logger.warn('ServiceWorker', 'Background sync not supported');
        return false;
    }

    try {
        await swRegistration.sync.register(tag);
        Logger.info('ServiceWorker', 'Background sync requested', { tag });
        return true;
    } catch (error) {
        Logger.error('ServiceWorker', 'Background sync failed', error);
        return false;
    }
}

/**
 * Setup offline/online listeners
 */
export function setupConnectivityListeners() {
    window.addEventListener('online', async () => {
        isOnline = true;
        Logger.info('Network', 'Back online');
        UI.showToast('Back online - syncing data...', 'success');
        
        // Try to sync offline queue
        await requestBackgroundSync();
        
        updateOfflineQueueIndicator('syncing');
        try {
            const { processOfflineQueue } = await import('./db.js');
            const result = await processOfflineQueue();
            
            if (result.processed > 0) {
                UI.showToast(`Synced ${result.processed} offline operations`, 'success');
            }
            updateOfflineQueueIndicator('synced');
        } catch (error) {
            Logger.error('Network', 'Queue sync failed', error);
            updateOfflineQueueIndicator('error');
        }
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        Logger.warn('Network', 'Gone offline');
        UI.showToast('You are offline - changes will be queued', 'warning', 5000);
        updateOfflineQueueIndicator('offline');
    });
}

// (2026-07-13) Add offline queue status indicator in UI; was console log only
export async function updateOfflineQueueIndicator(state = null) {
    if (typeof document === 'undefined') return;
    let indicator = document.getElementById('securoOfflineQueueIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'securoOfflineQueueIndicator';
        indicator.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:99999;padding:6px 14px;border-radius:999px;font-size:0.75rem;font-weight:700;display:none;align-items:center;gap:8px;box-shadow:0 10px 24px rgba(15,23,42,0.18);backdrop-filter:blur(10px);cursor:pointer;transition:all 0.25s ease;font-family:sans-serif;';
        document.body.appendChild(indicator);
        indicator.addEventListener('click', async () => {
            if (navigator.onLine) {
                updateOfflineQueueIndicator('syncing');
                try {
                    const { processOfflineQueue } = await import('./db.js');
                    await processOfflineQueue();
                    updateOfflineQueueIndicator('synced');
                } catch (e) {
                    updateOfflineQueueIndicator('error');
                }
            }
        });
    }

    let queueSize = 0;
    try {
        const { getOfflineQueueSize } = await import('./db.js');
        queueSize = getOfflineQueueSize();
    } catch (e) {}

    const online = navigator.onLine;
    if (!online) {
        indicator.style.display = 'inline-flex';
        indicator.style.background = 'rgba(245, 158, 11, 0.95)';
        indicator.style.color = '#fff';
        indicator.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">cloud_off</span><span>Offline &bull; ' + queueSize + ' queued</span>';
        return;
    }

    if (state === 'syncing') {
        indicator.style.display = 'inline-flex';
        indicator.style.background = 'rgba(90, 31, 224, 0.95)';
        indicator.style.color = '#fff';
        indicator.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">sync</span><span>Syncing ' + (queueSize || 'offline') + ' actions...</span>';
        return;
    }

    if (state === 'synced') {
        indicator.style.display = 'inline-flex';
        indicator.style.background = 'rgba(16, 185, 129, 0.95)';
        indicator.style.color = '#fff';
        indicator.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">cloud_done</span><span>All changes synced</span>';
        setTimeout(() => {
            if (indicator && navigator.onLine) indicator.style.display = 'none';
        }, 3000);
        return;
    }

    if (queueSize > 0) {
        indicator.style.display = 'inline-flex';
        indicator.style.background = 'rgba(59, 130, 246, 0.95)';
        indicator.style.color = '#fff';
        indicator.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">sync_problem</span><span>' + queueSize + ' pending sync &bull; Click to sync</span>';
    } else {
        indicator.style.display = 'none';
    }
}

/**
 * Listen for service worker messages
 */
export function setupServiceWorkerListeners() {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.addEventListener('message', async (event) => {
        const { type, data } = event.data;

        switch (type) {
            case 'SYNC_OFFLINE_QUEUE':
                try {
                    const { processOfflineQueue } = await import('./db.js');
                    await processOfflineQueue();
                } catch (error) {
                    Logger.error('ServiceWorker', 'Queue processing failed', error);
                }
                break;
                
            case 'CACHE_UPDATED':
                Logger.info('ServiceWorker', 'Cache updated', data);
                break;
                
            default:
                Logger.info('ServiceWorker', 'Message received', { type, data });
        }
    });
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        Logger.warn('Notifications', 'Not supported');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission === 'denied') {
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        Logger.info('Notifications', 'Permission result', { permission });
        return permission === 'granted';
    } catch (error) {
        Logger.error('Notifications', 'Permission request failed', error);
        return false;
    }
}

/**
 * Show local notification
 */
export function showLocalNotification(title, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        Logger.warn('Notifications', 'Cannot show notification');
        return;
    }

    try {
        const notification = new Notification(title, {
            icon: '/logo.png',
            badge: '/logo.png',
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
            if (options.onClick) {
                options.onClick();
            }
        };

        return notification;
    } catch (error) {
        Logger.error('Notifications', 'Failed to show notification', error);
        return null;
    }
}

/**
 * Initialize all offline features
 */
export async function initializeOfflineSupport() {
    try {
        Logger.info('OfflineSupport', 'Initializing...');
        
        // Register service worker
        await registerServiceWorker();
        
        // Setup listeners
        setupConnectivityListeners();
        setupServiceWorkerListeners();
        
        // Request notification permission (optional)
        const notifGranted = await requestNotificationPermission();
        if (notifGranted) {
            Logger.info('OfflineSupport', 'Notifications enabled');
        }
        
        // Check for pending offline operations
        const { getOfflineQueueSize } = await import('./db.js');
        const queueSize = getOfflineQueueSize();
        
        if (queueSize > 0 && isOnline) {
            Logger.info('OfflineSupport', 'Found queued operations', { count: queueSize });
            await requestBackgroundSync();
        }
        
        updateOfflineQueueIndicator();
        Logger.info('OfflineSupport', 'Initialization complete');
        return true;
    } catch (error) {
        Logger.error('OfflineSupport', 'Initialization failed', error);
        return false;
    }
}

// Auto-initialize on import
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOfflineSupport);
} else {
    initializeOfflineSupport();
}
