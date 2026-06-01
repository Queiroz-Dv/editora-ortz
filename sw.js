// Service Worker - Editora Ortz PWA
// Cache: HTML Network First, assets locais Cache First, CDN Stale-While-Revalidate

const CACHE_VERSION = 'v1.2.19';
const STATIC_CACHE  = `ortz-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ortz-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE   = `ortz-images-${CACHE_VERSION}`;

// Recursos essenciais para pre-cache no install (shell da aplicacao)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/sobre.html',
  '/volumes.html',
  '/marcas.html',
  '/assets/css/home.bundle.css?v=1.2.19',
  '/assets/js/js.global.js?v=1.2.19',
  '/manifest.json',
  '/assets/images/institucional/img-institucional-01.png',
  '/assets/images/institucional/img-institucional-02.png',
  '/assets/images/contato/img-contato-01.png',
  '/assets/images/contato/img-contato-02.png',
  '/assets/images/hero/img-hero-01.webp',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
];

// Limite de entradas em caches dinamicos
const CACHE_LIMITS = new Map([
  [DYNAMIC_CACHE, 50],
  [IMAGE_CACHE, 30],
]);

// Instalacao
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-cache dos assets essenciais');
        // Adiciona individualmente para nao abortar tudo se um falhar
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) =>
              console.warn(`[SW] Falha no pre-cache: ${url}`, err)
            )
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Ativacao
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

// Interceptacao de requisicoes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisicoes nao-GET e chrome-extension://
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  // 1. Paginas HTML: Network First
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
  // 4. Assets estaticos locais: Cache First
  if (url.hostname === self.location.hostname) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }
  // 5. Demais requisicoes externas: Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// Estrategias de cache

/**
 * Network First: tenta a rede, usa cache se a rede falhar.
 * Ideal para paginas HTML (sempre a versao mais fresca).
 */
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      await trimCache(cacheName, CACHE_LIMITS.get(cacheName) ?? 50);
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Pagina offline de fallback
    return offlineFallback();
  }
}

/**
 * Cache First: serve do cache; atualiza o cache em background se a entrada expirar.
 * Ideal para assets estaticos que mudam raramente.
 */
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      await trimCache(cacheName, CACHE_LIMITS.get(cacheName) ?? 50);
    }
    return networkResponse;
  } catch (err) {
    console.warn('[SW] Recurso indisponivel e sem cache:', request.url);
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
        trimCache(cacheName, CACHE_LIMITS.get(cacheName) ?? 50);
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
 * Limita o numero de entradas em um cache para evitar crescimento ilimitado.
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
 * Pagina de fallback quando offline e sem cache disponivel.
 */
function offlineFallback() {
  return new Response(
    `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sem Conexao - Editora Ortz</title>
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
  <h1>Sem Conexao</h1>
  <p>Voce esta offline. Verifique sua conexao com a internet e tente novamente.</p>
  <button onclick="window.location.reload()">Tentar Novamente</button>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}
