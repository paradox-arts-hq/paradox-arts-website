// Local preview server for the Paradox Arts site (development: no caching, no compression).
// Usage: node serve.js <site-folder> [port]
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'site'));
const port = +process.argv[3] || 8080;
const T = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png',
  '.svg':'image/svg+xml', '.webp':'image/webp', '.woff2':'font/woff2', '.mp3':'audio/mpeg', '.xml':'application/xml', '.txt':'text/plain',
  '.webmanifest':'application/manifest+json', '.json':'application/json', '.pdf':'application/pdf' };
http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p); if (!f.startsWith(root)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => {
    if (e) {
      // like most static hosts: an unknown address gets the site's own 404.html, with a 404 status
      return fs.readFile(path.join(root, '404.html'), (e2, page) => {
        if (e2) { r.writeHead(404); return r.end('404'); }
        r.writeHead(404, { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store' }); r.end(page);
      });
    }
    r.writeHead(200, { 'Content-Type': T[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    r.end(d);
  });
}).listen(port, () => console.log('serving', root, 'on', port));
