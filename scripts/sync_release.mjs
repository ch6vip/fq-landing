#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

const repo = "ch6vip/novel-sound";
const page = new URL("../index.html", import.meta.url);
const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
  headers: { Accept: "application/vnd.github+json", "User-Agent": "fq-landing" },
  signal: AbortSignal.timeout(20000),
});
if (!response.ok) throw new Error(`GitHub release request failed: ${response.status}`);

const release = await response.json();
if (!/^v\d+\.\d+\.\d+$/.test(release.tag_name)) {
  throw new Error(`Unexpected release tag: ${release.tag_name}`);
}
const files = {
  android: "app-arm64-v8a-release.apk",
  android32: "app-armeabi-v7a-release.apk",
  windows: `fqapp-windows-${release.tag_name}.zip`,
};
const downloads = {};
for (const [platform, name] of Object.entries(files)) {
  const asset = release.assets.find((item) => item.name === name);
  if (!asset) throw new Error(`Release ${release.tag_name} is missing ${name}`);
  downloads[platform] = asset.browser_download_url;
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

let html = await readFile(page, "utf8");
for (const marker of ["data-version", "data-windows-file", "data-release", 'id="app-schema"',
  ...Object.keys(downloads).map((platform) => `data-download="${platform}"`)]) {
  if (!html.includes(marker)) throw new Error(`Page is missing release field: ${marker}`);
}
html = html.replace(/(<(?:span|code)\b[^>]*\bdata-version[^>]*>)[^<]*(<\/[^>]+>)/g,
  (_, open, close) => `${open}${release.tag_name}${close}`);
html = html.replace(/(<a\b[^>]*\bdata-download="([^"]+)"[^>]*\bhref=")[^"]*(")/g,
  (_, open, platform, close) => {
    if (!downloads[platform]) throw new Error(`Unknown download platform: ${platform}`);
    return open + escapeAttribute(downloads[platform]) + close;
  });
html = html.replace(/(<a\b[^>]*\bdata-release\b[^>]*\bhref=")[^"]*(")/g,
  (_, open, close) => open + escapeAttribute(release.html_url) + close);
html = html.replace(/(<code\b[^>]*\bdata-windows-file[^>]*>)[^<]*(<\/code>)/,
  (_, open, close) => open + files.windows + close);
html = html.replace(/(<script\b[^>]*\bid="app-schema"[^>]*>)[\s\S]*?(<\/script>)/,
  (block, open, close) => {
    const schema = JSON.parse(block.slice(open.length, -close.length));
    schema.softwareVersion = release.tag_name.slice(1);
    schema.downloadUrl = release.html_url;
    return `${open}\n${JSON.stringify(schema, null, 2)}\n${close}`;
  });

// Write only after every required release asset has been resolved.
await writeFile(page, html);
console.log(`Synced ${release.tag_name}: Android 64/32-bit, Windows, page labels and JSON-LD.`);
