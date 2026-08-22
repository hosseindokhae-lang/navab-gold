const http = require('http');
const { spawn } = require('child_process');

// Keep ONE source of truth for the application server. server.js owns the
// Tala connection, market cache, admin API and storefront.
const PUBLIC_PORT = Number(process.env.PORT || 3000);
const APP_PORT = PUBLIC_PORT + 1;

const child = spawn(process.execPath, ['server.js'], {
  env: { ...process.env, PORT: String(APP_PORT) },
  stdio: 'inherit'
});

child.on('exit', code => {
  if (code !== 0) process.exit(code || 1);
});

const proxy = http.createServer((req, res) => {
  const upstream = http.request({
    hostname: '127.0.0.1',
    port: APP_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${APP_PORT}` }
  }, r => {
    const isHtml = String(r.headers['content-type'] || '').includes('text/html');

    if (!isHtml) {
      res.writeHead(r.statusCode, r.headers);
      r.pipe(res);
      return;
    }

    const chunks = [];
    r.on('data', c => chunks.push(c));
    r.on('end', () => {
      let html = Buffer.concat(chunks).toString('utf8');

      // Only enhance the public main storefront. Admin and preview pages stay untouched.
      const pathname = String(req.url || '').split('?')[0];
      const isStorefront = pathname === '/' || pathname === '/index.html';
      if (isStorefront && html.includes('</body>')) {
        if (!html.includes('/market-strip.js')) {
          html = html.replace(
            '</body>',
            '<script src="/market-strip.js?v=20260823-1" defer></script></body>'
          );
        }
        if (!html.includes('/category-strip.js')) {
          html = html.replace(
            '</body>',
            '<script src="/category-strip.js?v=20260823-2" defer></script></body>'
          );
        }
      }

      const headers = { ...r.headers, 'content-length': Buffer.byteLength(html) };
      delete headers['content-encoding'];
      res.writeHead(r.statusCode, headers);
      res.end(html);
    });
  });

  upstream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad gateway');
    }
  });

  req.pipe(upstream);
});

proxy.listen(PUBLIC_PORT, '0.0.0.0', () => {
  console.log('[NAVAB] proxy listening on', PUBLIC_PORT, '-> app', APP_PORT);
});

function shutdown() {
  try { child.kill('SIGTERM'); } catch {}
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
