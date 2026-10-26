const CACHE_NAME = 'qc-toolbox-v35';
const ASSETS = [
  './index.html',
  './foodlab-theme.css',
  './foodlab-design-system.css',
  './foodlab-polish-phaseH.css',
  './foodlab-accessibility-phaseI.css',
  './foodlab-theme-repair-phaseJ.css',
  './foodlab-theme-repair-phaseK.css',
  './foodlab-theme-controls-phaseI.js',
  './foodlab-operations-ui.css',
  './foodlab-lab-ui.css',
  './foodlab-uiux-phaseB.css',
  './backup-manager.html',
  './order-merge-v19.html',
  './qc-brand-logo.webp',
  './qc-dairy-v2.html',
  './alis-print.html',
  './alis-official-template.svg',
  './lab-calc-v1.html',
  './checklist-hub.html',
  './dashboard.html',
  './manifest.json',
  './dashboard-manifest.json',
  './icon-192.png',
  './icon-512.png',
  './dashboard-icon-192.png',
  './dashboard-icon-512.png'
];

self.addEventListener('install', (event) => {
  // Any missing local file fails install rather than silently promising offline access.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('qc-toolbox-') && k !== CACHE_NAME).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request=event.request;
  if(request.method !== 'GET')return;
  // Never intercept, cache, or replay Supabase / auth / CDN responses.
  if(new URL(request.url).origin !== self.location.origin)return;
  const html=request.mode==='navigate'||(request.headers.get('accept')||'').includes('text/html');
  if(html){
    // Strip query parameters from the cache key. Print previews have unique values
    // in the URL and must still open from the cached HTML when offline.
    const url=new URL(request.url);
    const normalized=new Request(url.origin+url.pathname);
    event.respondWith(fetch(request).then(response=>{
      if(!response.ok)throw new Error('HTML request failed');
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(normalized,copy)));
      return response;
    }).catch(async()=> (await caches.match(normalized)) || (await caches.match('./index.html')) || Response.error()));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached || fetch(request).then(response=>{
    if(response.ok && response.type==='basic'){
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)));
    }
    return response;
  })));
});
