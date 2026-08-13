const CACHE_NAME = "creator-viewer-v1";

const FILES_TO_CACHE = [
    "./",
    "./user.html",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return Promise.all(
                    FILES_TO_CACHE.map(file => {

                        return fetch(file)
                            .then(response => {

                                if (!response.ok) {
                                    throw new Error(
                                        `Gagal cache: ${file}`
                                    );
                                }

                                return cache.put(
                                    file,
                                    response
                                );

                            });

                    })
                );

            })

    );

    self.skipWaiting();

});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(
                            name =>
                                name !== CACHE_NAME
                        )
                        .map(
                            name =>
                                caches.delete(name)
                        )

                );

            })

    );

    self.clients.claim();

});


self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request)
            .then(cached => {

                if (cached) {
                    return cached;
                }

                return fetch(event.request)
                    .then(response => {

                        if (
                            response.ok &&
                            response.type === "basic"
                        ) {

                            const clone =
                                response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        event.request,
                                        clone
                                    );

                                });

                        }

                        return response;

                    });

            })
            .catch(() => {

                return caches.match(
                    "./user.html"
                );

            })

    );

});