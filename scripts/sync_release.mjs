#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

const repo = "ch6vip/novel-sound";
const headers = { Accept: "application/vnd.github+json", "User-Agent": "fq-landing" };
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}
const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
  headers,
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
const sizes = {};
for (const [platform, name] of Object.entries(files)) {
  const asset = release.assets.find((item) => item.name === name);
  if (!asset) throw new Error(`Release ${release.tag_name} is missing ${name}`);
  if (!Number.isSafeInteger(asset.size) || asset.size <= 0) {
    throw new Error(`Release asset has an invalid size: ${name}`);
  }
  downloads[platform] = asset.browser_download_url;
  sizes[platform] = `${(asset.size / 1_000_000).toFixed(1)} MB`;
}

const published = new Date(release.published_at);
if (!release.published_at || Number.isNaN(published.getTime())) {
  throw new Error("Release publication date is missing or invalid.");
}
const releaseDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
}).format(published);

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

const page = new URL("../index.html", import.meta.url);
let html = await readFile(page, "utf8");

const requiredMarkers = [
  "data-version",
  'id="app-schema"',
  "data-windows-file",
  "data-release",
  "data-release-date",
  ...Object.keys(downloads).map((platform) => `data-download="${platform}"`),
  ...Object.keys(sizes).map((platform) => `data-size="${platform}"`),
];
for (const marker of requiredMarkers) {
  if (!html.includes(marker)) throw new Error(`index.html is missing release field: ${marker}`);
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
html = html.replace(/(<code\b[^>]*\bdata-windows-file[^>]*>)[^<]*(<\/code>)/g,
  (_, open, close) => open + files.windows + close);
html = html.replace(/(<(?:span|li)\b[^>]*\bdata-size="([^"]+)"[^>]*>)[^<]*(<\/[^>]+>)/g,
  (_, open, platform, close) => {
    if (!sizes[platform]) throw new Error(`Unknown package size: ${platform}`);
    return open + sizes[platform] + close;
  });
html = html.replace(/(<time\b[^>]*\bdata-release-date\b[^>]*\bdatetime=")[^"]*("[^>]*>)[^<]*(<\/time>)/g,
  (_, open, middle, close) => open + published.toISOString() + middle + releaseDate + close);
html = html.replace(/(<script\b[^>]*\bid="app-schema"[^>]*>)[\s\S]*?(<\/script>)/,
  (block, open, close) => {
    const schema = JSON.parse(block.slice(open.length, -close.length));
    schema.softwareVersion = release.tag_name.slice(1);
    schema.downloadUrl = release.html_url;
    return `${open}\n${JSON.stringify(schema, null, 2)}\n${close}`;
  });

await writeFile(page, html);
console.log(`Synced ${release.tag_name} in index.html: packages, sizes, release date and JSON-LD.`);
