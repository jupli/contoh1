// Verifies the exact vercel.json headers (incl. CSP) against the built dist/index.html.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const allHeaders = config.headers.filter((h) => h.source === '/(.*)').flatMap((h) => h.headers);
const htmlHeaders = Object.fromEntries(allHeaders.map((h) => [h.key, h.value]));

const server = createServer(async (req, res) => {
  const body = await readFile('dist/index.html');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...htmlHeaders });
  res.end(body);
});
await new Promise((resolve) => server.listen(4321, '127.0.0.1', resolve));

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
const violations = [];
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 220)); });
page.on('requestfailed', (r) => violations.push(`requestfailed: ${r.url().slice(0, 120)}`));
await page.addInitScript(() => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', (e) => {
    window.__csp.push(`${e.violatedDirective} blocked ${e.blockedURI}`);
  });
});

await page.goto('http://127.0.0.1:4321/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);

const out = {};
out.title = await page.title();
out.heroImageLoaded = await page.locator('main img').first().evaluate((i) => i.complete && i.naturalWidth > 0);
out.totalImages = await page.locator('img').count();
out.brokenImages = await page.locator('img').evaluateAll((imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc).slice(0, 5));
out.backgroundPattern = await page.evaluate(() => getComputedStyle(document.querySelector('main')).backgroundImage.includes('berduflare'));
out.fontLoaded = await page.evaluate(() => document.fonts.check('700 24px "Libre Baskerville"'));

// Exercise the pieces that load third-party origins or inline code.
await page.goto('http://127.0.0.1:4321/#/wakaf', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1800);
await page.locator('#donor-name').fill('CSP Tester');
await page.locator('#donor-phone').fill('081234567890');
await page.getByRole('button', { name: /Bismillah Saya Sedekah Mushaf Al Quran/ }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: /Bayar Sekarang/ }).click();
await page.waitForTimeout(900);
out.qrisModal = await page.locator('[role="dialog"]').isVisible();
out.qrisImageLoaded = await page.locator('[role="dialog"] img').first().evaluate((i) => i.complete && i.naturalWidth > 0).catch(() => false);
await page.getByRole('tab', { name: 'QR Invoice' }).click();
await page.waitForTimeout(400);
out.qrRendered = await page.locator('[role="dialog"] svg[width="188"] path').evaluateAll((p) => p.reduce((n, el) => n + (el.getAttribute('d') || '').length, 0)) > 1000;
await page.getByRole('button', { name: 'Saya Sudah Bayar' }).click();
await page.waitForTimeout(2400);
out.celebration = await page.getByRole('dialog', { name: 'Donasi berhasil' }).isVisible();
out.toast = await page.locator('.toast-card').count();
await page.getByRole('button', { name: 'Lihat Papan Donasi' }).click();
await page.waitForTimeout(1200);
out.wallEntry = (await page.locator('#papan-donasi .entry-card-new').innerText()).replace(/\s+/g, ' ').slice(0, 130);

// YouTube iframe (frame-src) — video ada di halaman Keutamaan
await page.goto('http://127.0.0.1:4321/#/keutamaan', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1800);
await page.getByRole('button', { name: 'Putar video penyaluran AmalQu' }).click();
await page.waitForTimeout(2500);
out.videoFrameAttached = await page.locator('iframe').count();
out.videoFrameBlocked = await page.evaluate(() => {
  const f = document.querySelector('iframe');
  if (!f) return 'no-iframe';
  try { return f.contentWindow ? 'loaded' : 'blocked'; } catch { return 'cross-origin-loaded'; }
});
await page.keyboard.press('Escape');

out.cspViolations = await page.evaluate(() => window.__csp);
out.requestFailures = [...new Set(violations)].slice(0, 8);
out.consoleErrors = [...new Set(consoleErrors)].filter((t) => /Content Security Policy|Refused/i.test(t)).slice(0, 8);
console.log(JSON.stringify(out, null, 2));
await browser.close();
server.close();
