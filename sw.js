// Service Worker - Editora Ortz PWA
// Cache: HTML Network First, assets locais Cache First, CDN Stale-While-Revalidate

const CACHE_VERSION = 'v1.1.0';
const STATIC_CACHE  = `ortz-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ortz-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE   = `ortz-images-${CACHE_VERSION}`;

// Recursos essenciais para prÃ©-cache no install (shell da aplicaÃ§Ã£o)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/sobre.html',
  '/volumes.html',
  '/marcas.html',
  '/assets/css/site.css',
  '/assets/css/responsive.css',
  '/assets/js/js.global.js',
  '/manifest.json',
  '/assets/images/institucional/img-institucional-01.png',
  '/assets/images/institucional/img-institucional-02.png',
  '/assets/images/contato/img-contato-01.png',
  '/assets/images/contato/img-contato-02.png',
  '/assets/images/hero/img-hero-01.webp',
  '/assets/images/servicos/img-servicos-01.png',
  '/assets/images/servicos/img-servicos-02.png',
  '/assets/images/servicos/img-servicos-03.png',
  '/assets/images/volumes/img-volumes-01.png',
  '/assets/images/volumes/img-volumes-02.png',
  '/assets/images/volumes/img-volumes-03.png',
  '/assets/images/volumes/img-volumes-04.png',
  '/assets/images/volumes/img-volumes-05.png',
  '/assets/images/volumes/img-volumes-06.png',
  '/assets/images/volumes/img-volumes-07.png',
  '/assets/images/volumes/img-volumes-08.png',
  '/assets/images/volumes/img-volumes-09.png',
  '/assets/images/volumes/img-volumes-10.png',
  '/assets/images/marcas/img-marcas-01-logo.png',
  '/assets/images/marcas/img-marcas-01.png',
  '/assets/images/marcas/img-marcas-02-logo.png',
  '/assets/images/marcas/img-marcas-02.png',
  '/assets/images/marcas/img-marcas-03-logo.png',
  '/assets/images/marcas/img-marcas-03.png',
  '/assets/images/marcas/img-marcas-04-logo.png',
  '/assets/images/marcas/img-marcas-04.png',
  '/assets/images/marcas/img-marcas-05-logo.png',
  '/assets/images/marcas/img-marcas-05.png',
  '/assets/images/marcas/img-marcas-06-logo.png',
  '/assets/images/marcas/img-marcas-06.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
];

// Limite de entradas em caches dinÃ¢micos
const CACHE_LIMITS = {
  [DYNAMIC_CACHE]: 50,
  [IMAGE_CACHE]:   30,
};

// InstalaÃ§Ã£o
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] PrÃ©-cache dos assets essenciais');
        // Adiciona individualmente para nÃ£o abortar tudo se um falhar
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) =>
              console.warn(`[SW] Falha no prÃ©-cache: ${url}`, err)
            )
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// AtivaÃ§Ã£o
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => {
              console.log('[SW] Removendo cache antigo:', name);
              return caches.delete(name);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// InterceptaÃ§Ã£o de requisiÃ§Ãµes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisiÃ§Ãµes nÃ£o-GET e chrome-extension://
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  // 1. PÃ¡ginas HTML: Network First
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }
  // 2. Imagens locais: Cache First com fallback de rede
  if (url.hostname === self.location.hostname && isImageRequest(request)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }
  // 3. Assets do CDN: Stale-While-Revalidate
  if (isCdnRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }
  // 4. Assets estÃ¡ticos locais: Cache First
  if (url.hostname === self.location.hostname) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }
  // 5. Demais requisiÃ§Ãµes externas: Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// EstratÃ©gias de cache

/**
 * Network First: tenta a rede, usa cache se a rede falhar.
 * Ideal para pÃ¡ginas HTML (sempre a versÃ£o mais fresca).
 */
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      await trimCache(cacheName, CACHE_LIMITS[cacheName] ?? 50);
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // PÃ¡gina offline de fallback
    return offlineFallback();
  }
}

/**
 * Cache First: serve do cache; atualiza o cache em background se a entrada expirar.
 * Ideal para assets estÃ¡ticos que mudam raramente.
 */
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      await trimCache(cacheName, CACHE_LIMITS[cacheName] ?? 50);
    }
    return networkResponse;
  } catch (err) {
    console.warn('[SW] Recurso indisponÃ­vel e sem cache:', request.url);
    throw err;
  }
}

/**
 * Stale-While-Revalidate: serve do cache imediatamente e atualiza em background.
 * Ideal para CDNs e recursos externos.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        trimCache(cacheName, CACHE_LIMITS[cacheName] ?? 50);
      }
      return networkResponse;
    })
    .catch(() => cached);

  return cached ?? fetchPromise;
}

// Utilidades

function isImageRequest(request) {
  return /\.(png|jpg|jpeg|webp|gif|svg|ico)(\?.*)?$/.test(request.url);
}

function isCdnRequest(url) {
  const CDN_HOSTS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com',
  ];
  return CDN_HOSTS.some((host) => url.hostname.includes(host));
}

/**
 * Limita o nÃºmero de entradas em um cache para evitar crescimento ilimitado.
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

/**
 * PÃ¡gina de fallback quando offline e sem cache disponÃ­vel.
 */
function offlineFallback() {
  return new Response(
    `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sem ConexÃ£o - Editora Ortz</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 1.5rem;
      background: #0d0d0d;
      color: #e8e0d4;
      font-family: 'Montserrat', Georgia, sans-serif;
      text-align: center;
      padding: 2rem;
    }
    .icon {
      width: 80px;
      height: 80px;
      opacity: 0.4;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 300;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #8B7355;
    }
    p {
      font-size: 0.9rem;
      opacity: 0.6;
      max-width: 320px;
      line-height: 1.7;
    }
    button {
      margin-top: 0.5rem;
      padding: 0.75rem 2rem;
      background: transparent;
      border: 1px solid #8B7355;
      color: #8B7355;
      font-family: inherit;
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.2s;
    }
    button:hover { background: #8B7355; color: #0d0d0d; }
  </style>
</head>
<body>
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#8B7355" stroke-width="1.5">
    <path d="M1 6.5C1 6.5 5 2 12 2s11 4.5 11 4.5"/>
    <path d="M1 17.5C1 17.5 5 22 12 22s11-4.5 11-4.5"/>
    <line x1="12" y1="2" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#c0392b"/>
  </svg>
  <h1>Sem ConexÃ£o</h1>
  <p>VocÃª estÃ¡ offline. Verifique sua conexÃ£o com a internet e tente novamente.</p>
  <button onclick="window.location.reload()">Tentar Novamente</button>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}
