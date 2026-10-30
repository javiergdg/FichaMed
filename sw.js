// Service worker: guarda la interfaz completa y los recursos necesarios para el modo offline.
const V = 'fichamed-v5';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'doctor-perro.png',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // CIMA y proxy: red directa (las fichas guardadas se gestionan localmente en localStorage)
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const cp = r.clone();
        caches.open(V).then(c => c.put(e.request, cp));
        return r;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match('index.html')))
  );
});
