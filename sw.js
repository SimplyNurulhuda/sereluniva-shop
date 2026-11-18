const V='sereluniva-v17';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
// A response that went through a redirect cannot be used for a page load, so rebuild it as a plain one.
const clean=r=>{ if(!r||!r.redirected) return Promise.resolve(r); return r.blob().then(b=>new Response(b,{status:200,statusText:'OK',headers:r.headers})); };
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>fetch(u,{cache:'reload'}).then(clean).then(r=>r&&r.ok?c.put(u,r):null).catch(()=>null)))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  if(new URL(r.url).origin!==location.origin||new URL(r.url).pathname.startsWith('/api/')) return; // let the browser fetch other sites (text reader files) directly
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(clean).then(n=>{ if(n&&n.ok){ const c=n.clone(); caches.open(V).then(x=>x.put('index.html',c)); } return n; })
      .catch(()=>caches.match('index.html').then(h=>h||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(h=>h||fetch(r).then(n=>{ if(n&&(n.ok||n.type==='opaque')){ const c=n.clone(); caches.open(V).then(x=>x.put(r,c)); } return n; })));
});
