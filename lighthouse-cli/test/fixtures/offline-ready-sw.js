/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
