/* global caches, fetch, self */

var VERSION = '15';
var filesToCache = [
  './offline-ready.html',
  './offline-ready-sw.js',
  './smoketest-config.json'
];

this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(VERSION).then(cache => {
      return cache.addAll(filesToCache).then(_ => {
        self.skipWaiting();
      });
    })
  );
});

this.addEventListener('fetch', function(e) {
  e.respondWith(caches.match(e.request).then(res => {
    // If there is no match in the cache, we get undefined back,
    // in that case go to the network!
    return res ? res : handleNoCacheMatch(e);
  }));
});

this.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.map(k => {
      if (k !== VERSION) {
        return caches.delete(k);
      }
      return undefined;
    })).then(_ => {
      return this.clients.claim();
    });
  }));
});

// fetch from network and put into our cache
function handleNoCacheMatch(e) {
  return fetch(e.request).then(res => {
    return caches.open(VERSION).then(cache => {
      cache.put(e.request, res.clone());
      return res;
    });
  });
}
