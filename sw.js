/* ============================================================
   SERVICE WORKER - Kelebek
   ============================================================ */

const CACHE = 'kelebek-runtime';
const OFFLINE_URL = './index.html';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/components.css',
  './js/app.js',
  './js/cart.js',
  './js/search.js',
  './js/store-info.js',
  './js/ofertas.js',
  
  './js/products/alimentos.js',
  './js/products/bebidas.js',
  './js/products/embutidos.js',
  './js/products/confituras.js',
  './js/products/aseo.js',
  './js/products/limpieza.js',
  './js/products/perfumes.js',
  './js/products/ropa.js',
  './js/products/calzado.js',
  './js/products/hogar.js',
  './js/products/index.js',

  './icons/logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(
        PRECACHE.map(url => cache.add(url).catch(() => {}))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (/wa\.me|whatsapp\.com|instagram\.com|google\.com\/maps|googleapis\.com\/maps/i.test(url.href)) return;

  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(networkFirst(req, OFFLINE_URL));
    return;
  }

  if (['script', 'style'].includes(req.destination) || /\.(js|css|json)$/i.test(url.pathname)) {
    event.respondWith(networkFirst(req));
    return;
  }

  if (['image', 'font'].includes(req.destination) || /\.(png|jpe?g|webp|svg|gif|woff2?|ttf|otf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  event.respondWith(cacheFirst(req));
});

async function networkFirst(req, fallbackUrl) {
  try {
    const fresh = await fetch(req, { cache: 'no-store' });
    if (fresh && fresh.status === 200 && fresh.type === 'basic') {
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (_) {
    const cached = await caches.match(req);
    if (cached) return cached;
    if (fallbackUrl) {
      const fb = await caches.match(fallbackUrl);
      if (fb) return fb;
    }
    return new Response('Sin conexión', { status: 503 });
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200 && fresh.type === 'basic') {
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (_) {
    return new Response('', { status: 504 });
  }
}

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});