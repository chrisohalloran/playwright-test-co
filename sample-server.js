// Minimal static file server for the sample project
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = new URL('./sample-project', import.meta.url).pathname;
const PORT = 3847;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

const server = createServer(async (req, res) => {
  let filePath = join(ROOT, req.url === '/' ? '/public/index.html' : req.url);

  // Try public/ prefix if direct path fails
  try {
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'text/plain' });
    res.end(content);
  } catch {
    try {
      filePath = join(ROOT, 'public', req.url);
      const content = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'text/plain' });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  }
});

server.listen(PORT, () => console.log(`Sample app on http://localhost:${PORT}`));
