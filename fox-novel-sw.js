/* 狐狐写作台 Service Worker —— 让 PWA 全屏安装后离线可用
 * 放在与 fox-novel.html 同一目录即可。
 * 本地 file:// 打开时页面会静默跳过注册，不影响使用。
 */
var CACHE = 'fox-novel-v1';
var CORE = ['./fox-novel.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
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
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res && res.ok && e.request.destination === 'document') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        // 离线兜底：直接回页面本体
        return caches.match('./fox-novel.html');
      });
    })
  );
});
