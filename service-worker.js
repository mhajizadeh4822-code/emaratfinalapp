const CACHE_NAME = 'inventory-cache-v1';

const urlsToCache = [

  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon.png',

  './libs/html5-qrcode.min.js',
  './libs/xlsx.full.min.js'

];

// نصب
self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => {

        return cache.addAll(urlsToCache);

      })

  );

});

// کش
self.addEventListener('fetch', event => {

  event.respondWith(

    caches.match(event.request)

      .then(response => {

        return response || fetch(event.request);

      })

  );

});

// آپدیت کش
self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys.map(key => {

          if (key !== CACHE_NAME) {

            return caches.delete(key);

          }

        })

      );

    })

  );

});
