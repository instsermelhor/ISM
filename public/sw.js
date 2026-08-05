/**
 * sw.js — Service Worker Oficial PWA do Instituto Ser Melhor
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Caching inteligente (Stale-While-Revalidate) e suporte a modo offline.
 */

const CACHE_NAME = 'ism-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-ism.png',
];

// ── Install Event ────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate Event ───────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch Event (Stale-While-Revalidate) ─────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Evita cachear chamadas de API Firestore/Firebase de escrita/leitura dinâmica
  if (url.origin.includes('firestore') || url.origin.includes('googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback em caso de offline sem cache prévio
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
