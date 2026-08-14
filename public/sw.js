/**
 * sw.js — Service Worker Oficial PWA v2 — Instituto Ser Melhor
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Estratégias avançadas de caching:
 * - Cache-First para assets estáticos imutáveis (/assets/*, fontes, imagens, logo).
 * - Stale-While-Revalidate para navegação HTML e manifesto.
 * - Background Sync para submissões offline (leads, voluntários, contato).
 * - Network-Only para APIs e gateways de pagamento.
 */

const CACHE_VERSION = 'ism-pwa-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-ism.png',
  '/robots.txt',
];

// ── 1. Install Event ────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── 2. Activate Event (Limpeza de Caches Anteriores) ────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('ism-pwa-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Expurgo de cache antigo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── 3. Fetch Event com Estratégias Especializadas ──────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Bypass para APIs dinâmicas, Stripe, Cloud Functions e Firebase
  if (
    url.origin.includes('firestore') ||
    url.origin.includes('googleapis') ||
    url.origin.includes('cloudfunctions.net') ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('stripe.com')
  ) {
    return;
  }

  // ESTRATÉGIA A: Cache-First para Assets Estáticos com Hash (/assets/*, imagens, fontes)
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // ESTRATÉGIA B: Stale-While-Revalidate para Navegação HTML e Páginas SPA
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback para index.html em caso de falha de rede (SPA fallback offline)
          return caches.match('/index.html');
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// ── 4. Background Sync Event (Replay de Formulários Offline) ───────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-forms') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'BACKGROUND_SYNC_TRIGGER' });
        });
      })
    );
  }
});
