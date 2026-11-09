// Production-like server for audits: gzip for text, long-lived caching for assets, no-cache for HTML.
// This mirrors what the real host should do (see SETUP-STATUS.md). Usage: node prodserve.js <site-folder> [port]
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'site'));
const port = +process.argv[3] || 8095;
const T = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.webp':'image/webp', '.woff2':'font/woff2', '.mp3':'audio/mpeg',
  '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.webmanifest':'application/manifest+json', '.json':'application/json', '.pdf':'application/pdf' };
http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p); if (!f.startsWith(root)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => {
    if (e) {
      // like most static hosts: an unknown address gets the site's own 404.html, with a 404 status
      return fs.readFile(path.join(root, '404.html'), (e2, page) => {
        if (e2) { r.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }); return r.end('Not found'); }
        r.writeHead(404, { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-cache' }); r.end(page);
      });
    }
    const ext = path.extname(f).toLowerCase(), type = T[ext] || 'application/octet-stream';
    const h = { 'Content-Type': type, 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' };
    if (/^(text\/|application\/(xml|json|manifest))|svg/.test(type) && /gzip/.test(q.headers['accept-encoding'] || '')) {
      h['Content-Encoding'] = 'gzip'; h['Vary'] = 'Accept-Encoding'; d = zlib.gzipSync(d, { level: 9 });
    }
    if (ext === '.mp3') h['Accept-Ranges'] = 'bytes';
    r.writeHead(200, h); r.end(d);
  });
}).listen(port, () => console.log('production-like server', root, port));
