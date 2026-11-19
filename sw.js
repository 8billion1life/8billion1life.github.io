// 8 Milyar 1 Hayat – çevrimdışı önbellek. Sürüm değişince CACHE adını artır.
const CACHE = 'b1h-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './maskable-512.png'];
const CDN = ['https://cdn.tailwindcss.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(CORE);
    for (const u of CDN) { try { await c.add(new Request(u, { mode: 'no-cors' })); } catch (_) {} }
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;           // e-posta (POST) ve diğerleri dokunulmaz
  const url = new URL(req.url);
  if (url.hostname === 'formsubmit.co') return;
  // Sayfa: önce ağ (güncel sürüm), olmazsa önbellek
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  // Diğerleri (Tailwind, yazı tipi, ikonlar): önce önbellek, arkadan güncelle
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
