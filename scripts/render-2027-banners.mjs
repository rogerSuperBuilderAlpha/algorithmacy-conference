import path from 'node:path';
import { pathToFileURL } from 'node:url';

const playwrightHref = process.env.PLAYWRIGHT_CORE
  || pathToFileURL(path.resolve('node_modules/playwright-core/index.js')).href;
const playwright = await import(playwrightHref);
const chromium = playwright.chromium || playwright.default.chromium;

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const html = pathToFileURL(path.join(root, 'design/banners/conference-2027.html')).href;
const shots = [
  ['#share', path.join(root, 'images/social-share-2027.png')],
  ['#hero', path.join(root, 'images/hero-algorithmacy-2027.png')],
];

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.goto(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
for (const [selector, file] of shots) {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error('missing ' + selector);
  await page.locator(selector).screenshot({ path: file, omitBackground: false });
  console.log(selector, Math.round(box.width), Math.round(box.height), file);
}
await browser.close();
