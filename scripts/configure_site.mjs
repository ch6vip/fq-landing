#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm run site -- https://your-domain.example/path/");
const site = new URL(input);
if (site.protocol !== "https:" || site.href !== site.origin + site.pathname) {
  throw new Error("Provide the public HTTPS site URL without credentials, query or fragment.");
}
if (!site.pathname.endsWith("/")) site.pathname += "/";

const page = new URL("../index.html", import.meta.url);
let html = await readFile(page, "utf8");
const block = /<!-- site-meta:start -->[\s\S]*?<!-- site-meta:end -->/;
if (!block.test(html)) throw new Error("Site metadata block is missing from index.html.");
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
const canonical = escape(site.href);
const image = escape(new URL("assets/img/og.jpg", site).href);
html = html.replace(block, [
  "<!-- site-meta:start -->",
  `<link rel="canonical" href="${canonical}">`,
  `<meta property="og:url" content="${canonical}">`,
  `<meta property="og:image" content="${image}">`,
  `<meta name="twitter:image" content="${image}">`,
  "<!-- site-meta:end -->",
].join("\n"));
await writeFile(page, html);
console.log(`Configured canonical URL and share image: ${site.href}`);
