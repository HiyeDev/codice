// Códice móvil: funciona sin conexión y se actualiza sola cuando hay internet
const CACHE = 'codice-movil-v2';
const BASE = ['./', 'index.html', 'manifest.json', 'icono.svg', 'icono-192.png', 'icono-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // La propia app: primero la red (para recibir mejoras) y, sin conexión, la copia guardada
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put('index.html', c)); return res; }).catch(() => caches.match('index.html')));
    return;
  }
  // Tipografías, librerías e iconos: primero la copia guardada
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    if (res.ok && (req.url.startsWith(self.location.origin) || /fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(req.url))) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
    return res;
  })));
});
