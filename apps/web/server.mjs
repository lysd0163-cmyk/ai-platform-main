import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const api = process.env.API_URL || 'http://localhost:4000';

createServer(async (req, res) => {
  if (req.url === '/api/health') {
    try {
      const r = await fetch(`${api}/health`);
      res.writeHead(r.ok ? 200 : 503, {'content-type':'application/json'});
      return res.end(await r.text());
    } catch { res.writeHead(503, {'content-type':'application/json'}); return res.end(JSON.stringify({status:'degraded'})); }
  }
  const html = await readFile(join(root, 'dist', 'index.html'));
  res.writeHead(200, {'content-type':'text/html; charset=utf-8'});
  res.end(html);
}).listen(port, () => console.log(`AI OS web listening on ${port}`));
