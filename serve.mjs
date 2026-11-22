import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT || 4173);
const root = join(process.cwd(), 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
};

http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  const relativePath = normalize(pathname).replace(/^[/\\]+/, '');
  let filePath = join(root, relativePath);

  try {
    if (!pathname.endsWith('/') && (await readFile(filePath)).length >= 0) {
      const content = await readFile(filePath);
      response.writeHead(200, {
        'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600',
      });
      response.end(content);
      return;
    }
  } catch {}

  try {
    const content = await readFile(join(root, 'index.html'));
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    response.end(content);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Build output not found');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`XPECTO frontend listening on port ${port}`);
});
