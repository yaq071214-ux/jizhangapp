/* 记一笔 · Service Worker（离线缓存） */
const CACHE = 'ledger-app-v1';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/charts.js',
  './js/app.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // 外部 CDN（Chart.js）：先缓存，后回退网络
  if (/cdn\.jsdelivr\.net/.test(e.request.url)) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
          c.put(e.request, res.clone());
          return res;
        }))
      )
    );
    return;
  }

  // 本地静态资源：缓存优先
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((res) => {
        const cp = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, cp));
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
