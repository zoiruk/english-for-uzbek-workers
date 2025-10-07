/**
 * Service Worker for English for Uzbek Seasonal Workers
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'uzbek-textbook-v1.0.0';
const STATIC_CACHE_NAME = 'uzbek-textbook-static-v1.0.0';

// Files to cache for offline use
const STATIC_FILES = [
    '/',
    '/index.html',
    '/glossary.html',
    '/grammar-reference.html',
    '/course-info.html',
    '/user-guide.html',
    '/progress-tracker.js',
    '/interactive-exercises.js',
    '/certificate-generator.js',
    // Chapter files
    '/English_for_Uzbek_Seasonal_Workers.html',
    '/Chapter_2_Numbers_Time.html',
    '/Chapter_3_Objects_Colours.html',
    '/Chapter_4_Basic_Verbs.html',
    '/Chapter_5_Adjectives_Adverbs.html',
    '/Chapter_6_Accommodation_Furniture.html',
    '/Chapter_7_Transportation_Travel.html',
    '/Chapter_8_Places_Navigation.html',
    '/Chapter_9_Shopping_Transactions.html',
    '/Chapter_10_Clothing_Weather.html',
    '/Chapter_11_Food_Cooking_Ordering.html',
    '/Chapter_12_Health_Medical.html',
    '/Chapter_13_Farm_Work_Tasks.html',
    '/Chapter_14_Employer_Instructions.html',
    '/Chapter_15_Requests_Permissions.html',
    '/Chapter_16_Banking_Finance.html',
    '/Chapter_17_Emergency_Safety.html',
    '/Chapter_18_Communication_Skills.html',
    '/Chapter_19_Countries_Languages.html',
    '/Chapter_20_Free_Time_Social.html',
    '/Chapter_21_Sports_Activities.html',
    '/Chapter_22_Family_Relations.html',
    '/Chapter_23_Writing_Forms.html',
    '/Chapter_24_Jobs_Future_Review.html'
];

// Install event - cache static files
self.addEventListener('install', function(event) {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(function(cache) {
                console.log('Caching static files...');
                return cache.addAll(STATIC_FILES);
            })
            .then(function() {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(function(cachedResponse) {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then(function(response) {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();

                        // Cache the response for future use
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(function(error) {
                        console.log('Fetch failed, serving offline page:', error);
                        
                        // For HTML requests, return the main page as fallback
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        
                        // For other requests, just fail
                        throw error;
                    });
            })
    );
});

// Background sync for progress data (if supported)
self.addEventListener('sync', function(event) {
    if (event.tag === 'progress-sync') {
        event.waitUntil(syncProgressData());
    }
});

// Sync progress data when back online
function syncProgressData() {
    return new Promise(function(resolve) {
        // This would sync progress data with a server if implemented
        // For now, just resolve as data is stored locally
        console.log('Progress data sync completed');
        resolve();
    });
}

// Handle push notifications (future feature)
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [200, 100, 200],
            data: data.data || {},
            actions: data.actions || []
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});

// Message handling for communication with main thread
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});