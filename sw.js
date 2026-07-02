// Service Worker NicoMultiServices
var CACHE = 'nms-v1';
var OFFLINE = [
  'vitrine.html',
  'manifest.json'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(OFFLINE).catch(function(){});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Ne met jamais en cache les requêtes Firebase
  if(e.request.url.includes('firebase') || e.request.url.includes('googleapis')){
    return e.respondWith(fetch(e.request));
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(response){
        // Met en cache les ressources locales statiques
        if(e.request.url.startsWith(self.location.origin)){
          var clone = response.clone();
          caches.open(CACHE).then(function(c){c.put(e.request, clone);});
        }
        return response;
      }).catch(function(){
        // Fallback hors-ligne : retourner la page principale mise en cache
        return caches.match('vitrine.html');
      });
    })
  );
});
