/* global caches, fetch, self */

var VERSION = '13';

this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(VERSION).then(cache => {
      return cache.addAll([
        '/offline-ready.html',
        '/offline-ready-sw.js',
        '/smoketest-config.json'
      ]);
    }).then(_ => {
      self.skipWaiting();
    })
  );
});

this.addEventListener('fetch', function(e) {
  var tryInCachesFirst = caches.open(VERSION).then(cache => {
    return cache.match(e.request).then(response => {
      return response || handleNoCacheMatch(e);
    });
  });
  e.respondWith(tryInCachesFirst);
});

this.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.map(key => {
      if (key !== VERSION) {
        return caches.delete(key);
      }
      return undefined;
    }));
  }));
});

function handleNoCacheMatch(e) {
  return fetch(e.request).then(res => {
    return caches.open(VERSION).then(cache => {
      cache.put(e.request, res.clone());
      return res;
    });
  });
}
