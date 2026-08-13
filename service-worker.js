const CACHE_NAME = "creator-viewer-v1";

const FILES_TO_CACHE = [
    "./",
    "./user.html",
    "./icon-192.png",
    "./icon-512.png",
    "./manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
            .catch(error => {
                console.error("Creator Viewer cache gagal:", error);
                throw error;
            })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        self.clients.claim()
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});