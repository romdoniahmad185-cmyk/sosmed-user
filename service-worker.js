const CACHE_NAME = "creator-viewer-v1";

const FILES_TO_CACHE = [
    "./",
    "./user.html",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];


/* ================================
   INSTALL
================================ */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    self.skipWaiting();

});


/* ================================
   ACTIVATE
================================ */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(
                            cacheName =>
                                cacheName !== CACHE_NAME
                        )
                        .map(
                            cacheName =>
                                caches.delete(
                                    cacheName
                                )
                        )

                );

            })

    );

    self.clients.claim();

});


/* ================================
   FETCH
================================ */

self.addEventListener("fetch", event => {

    const request = event.request;

    /*
       Hanya menangani request GET.
    */

    if (request.method !== "GET") {
        return;
    }


    event.respondWith(

        caches.match(request)
            .then(cachedResponse => {

                /*
                   Kalau ada di cache,
                   gunakan cache.
                */

                if (cachedResponse) {

                    return cachedResponse;

                }


                /*
                   Kalau belum ada,
                   ambil dari internet.
                */

                return fetch(request)
                    .then(networkResponse => {

                        /*
                           Simpan response yang valid
                           ke cache.
                        */

                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === "basic"
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(
                                CACHE_NAME
                            )
                            .then(cache => {

                                cache.put(
                                    request,
                                    responseClone
                                );

                            });

                        }

                        return networkResponse;

                    });

            })

            .catch(() => {

                /*
                   Jika internet mati dan halaman
                   tidak tersedia di cache.
                */

                return caches.match(
                    "./index.html"
                );

            })

    );

});