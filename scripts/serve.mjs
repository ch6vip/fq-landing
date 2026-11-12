#!/usr/bin/env node
/**
 * Zero-dependency static server for the landing page.
 * Usage: node scripts/serve.mjs [port]
 */
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const port = Number(process.argv[2] || process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

const server = createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }
  if (pathname.endsWith("/")) pathname += "index.html";

  const file = join(root, normalize(pathname).replace(/^([/\\])+/, ""));
  if (!file.startsWith(root)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  let stat;
  try {
    stat = statSync(file);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("404 Not Found");
    return;
  }
  if (stat.isDirectory()) {
    res.writeHead(302, { location: pathname.replace(/\/?$/, "/") + "index.html" }).end();
    return;
  }

  res.writeHead(200, {
    "content-type": types[extname(file).toLowerCase()] || "application/octet-stream",
    "content-length": stat.size,
    "cache-control": "no-cache",
  });
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`什锦铺 landing → http://localhost:${port}`);
});
