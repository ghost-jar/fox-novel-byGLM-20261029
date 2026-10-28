/* 狐狐写作台 Service Worker v2 —— 运行时缓存版
 * 不依赖页面文件名：第一次在线打开后，页面本体会被自动存进缓存，
 * 之后再断网也能打开。更新本文件后，重新访问一次网页即可生效。
 */
var CACHE = 'fox-novel-v2';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    /* 页面本体：网络优先，成功就顺手更新缓存；断网就用缓存 */
    e.respondWith(
      fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (hit) {
          return hit || Response.error();
        });
      })
    );
    return;
  }
  /* 其他资源：缓存优先 */
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request);
    })
  );
});
