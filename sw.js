const CACHE='hegan-v4',TILES='hegan-tiles';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(new Request(f,{cache:'reload'})).then(r=>{if(r.ok)return c.put(f,r)})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE&&x!==TILES).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function trim(c){const k=await c.keys();if(k.length>1500)for(const r of k.slice(0,150))await c.delete(r)}
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(u.hostname==='tile.openstreetmap.org'){
  e.respondWith(caches.open(TILES).then(async c=>{const r=await c.match(e.request);if(r)return r;
   try{const n=await fetch(e.request);if(n.ok){c.put(e.request,n.clone());trim(c)}return n}catch(_){return Response.error()}}));return}
 if(e.request.method!=='GET'||u.origin!==location.origin)return;
 // Se sirve al instante lo guardado (funciona sin internet) y en segundo plano se descarga la versión nueva
 e.respondWith(caches.open(CACHE).then(async c=>{
  const hit=await c.match(e.request,{ignoreSearch:true});
  const net=fetch(e.request,{cache:'reload'}).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>null);
  if(hit){e.waitUntil(net);return hit}
  return (await net)||Response.error();
 }));
});
