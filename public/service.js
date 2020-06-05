
const PRECACHE = 'HERO-CACHE-v1';
const RUNTIME = 'HERO-RUNTIME-v1';
var DOMAIN = "http://localhost:7655";

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    '/',
    'js/vendors~main.index.bundle.js',
    'js/index.bundle.js',
    'jquery.min.js',
    "font/IconFont/webfont.eot",
    "font/IconFont/webfont.ttf",
    "font/IconFont/webfont.woff",
    "font/IconFont/webfont.woff2"
];
/// resource will change data time
const RUNTIME_URLS_IGNORE = [
    '/service.js',
    "/save-subscription",
    "/show-noti"
];
// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
    caches.open(PRECACHE)
    .then(cache => cache.addAll(PRECACHE_URLS))
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});


// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
    // console.log("fetch before cache " + event.request.url)
    for (var index_url = 0; index_url < RUNTIME_URLS_IGNORE.length; index_url++) {
        // console.log("compare -" + event.request.url + "-/-" + DOMAIN + RUNTIME_URLS_IGNORE[index_url])
        if (event.request.url == DOMAIN + RUNTIME_URLS_IGNORE[index_url]) {
            return;
        }
    }
    // Skip cross-origin requests, like those for Google Analytics.
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return caches.open(RUNTIME).then(cache => {
                    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
                        return;
                    }
                    return fetch(event.request)
                    .then(response => {
                        // Put a copy of the response in the runtime cache.
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    })
                });
            })
        );
    }
});

self.addEventListener('push', function (event) {
    console.log(event, 'Received push');

    var serverData = event.data.json();
    if(serverData){
        console.log(serverData)

        var title = serverData.title ? serverData.title : "thông báo";
        var notifiBody = serverData.body ? serverData.body : 'thông báo cho vui';
        var imageIcon = serverData.imageUrl ? serverData.imageUrl : "favicon/apple-icon-57x57.png";
        var rUrl       = serverData.redirectUrl ? serverData.redirectUrl : DOMAIN + "/chat";
        
        self.registration.showNotification(title,{
            body : notifiBody,
            icon : imageIcon,
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1,
                redirectUrl : rUrl
            },
            timeout : 1000
        });
    }else{
        console.log("There is no data to be displayed.");
    }
});

