import fs from 'node:fs';
import path from 'node:path';

// Directories that are not a page. Page directories are discovered from index.html
// so a new top-level page is copied and given a clean URL without another edit.
export const ASSET_DIRS = [
  'assets',
  'images',
  'design-system',
  'data',
  '.well-known',
];

const SKIP_DIRS = new Set([
  'node_modules',
  'public',
  '.git',
  '.next',
  'app',
  'coverage',
]);

// Every top-level directory that contains index.html is a public page.
export function pageDirectories(root) {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && !SKIP_DIRS.has(entry.name))
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(root, name, 'index.html')))
    .sort();
}

export function copyDirectories(root) {
  return [...new Set([...ASSET_DIRS, ...pageDirectories(root)])];
}

export const COPY_FILES = [
  'index.html',
  'robots.txt',
  'sitemap.xml',
  'favicon.svg',
  'favicon.ico',
  'favicon-32.png',
  'apple-touch-icon.png',
  'llms.txt',
  'llms-full.txt',
  'prompts.json',
];

// Clean URLs for every static index.html. Next serves public/news/index.html
// only at that exact path, so /news and /news/ need a rewrite. The portal
// and OAuth routes live under app/ and are not part of this list.
export function htmlRewrites(root) {
  const rewrites = [{ source: '/', destination: '/index.html' }];

  function visit(rel) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) return;
    if (fs.existsSync(path.join(abs, 'index.html'))) {
      const url = '/' + rel.split(path.sep).join('/');
      rewrites.push({ source: url, destination: url + '/index.html' });
      rewrites.push({ source: url + '/', destination: url + '/index.html' });
    }
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      if (entry.isDirectory()) visit(path.join(rel, entry.name));
    }
  }

  for (const dir of pageDirectories(root)) visit(dir);
  return rewrites;
}
