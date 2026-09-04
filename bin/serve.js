#!/usr/bin/env node

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// 1. Determinar puertos: process.env.PORT, argumentos de CLI (-p, -l, etc.) y 3000
const portsToListen = new Set();
const args = process.argv.slice(2);

if (process.env.PORT) {
  const p = parseInt(process.env.PORT, 10);
  if (!isNaN(p) && p > 0) portsToListen.add(p);
}

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if ((arg === '-p' || arg === '-l' || arg === '--port' || arg === '--listen') && args[i + 1]) {
    const match = args[i + 1].match(/(\d+)$/);
    if (match) {
      const p = parseInt(match[1], 10);
      if (!isNaN(p) && p > 0) portsToListen.add(p);
    }
  }
}

// Asegurar también puerto 3000 por si Render o cualquier proxy lo consulta
portsToListen.add(3000);

// 2. Determinar directorio a servir (por defecto dist)
let targetDir = path.resolve(process.cwd(), 'dist');
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (!arg.startsWith('-') && args[i - 1] !== '-p' && args[i - 1] !== '-l') {
    const candidate = path.resolve(process.cwd(), arg);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      targetDir = candidate;
      break;
    }
  }
}

// MIME types comunes
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const requestHandler = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  let pathname = decodeURIComponent(parsedUrl.pathname);

  let filePath = path.join(targetDir, pathname);
  if (!filePath.startsWith(targetDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // SPA fallback a index.html
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(targetDir, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error al leer archivo');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

for (const port of portsToListen) {
  try {
    const srv = http.createServer(requestHandler);
    srv.listen(port, '0.0.0.0', () => {
      console.log('==> Clinic Care Toy listening on port ' + port + ' (0.0.0.0)');
    });
    srv.on('error', (err) => {
      // Ignorar si el puerto ya está en uso
    });
  } catch (e) {}
}

console.log('==> Serving directory: ' + targetDir);
