import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173/';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/youtube|ggpht/i.test(m.text())) errors.push('console: ' + m.text().slice(0, 160)); });
const out = {};

try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Beranda
  out.homeTitle = await page.title();
  out.h1 = (await page.locator('h1').first().innerText()).slice(0, 60);
  out.navLinks = await page.locator('header nav a').count();
  out.ribbon = await page.locator('.ribbon').isVisible();
  out.stats = (await page.locator('.stat-panel dl').innerText()).replace(/\s+/g, ' ').trim();
  out.steps = await page.locator('.step-item').count();
  out.miniEntries = await page.locator('.mini-entry').count();
  out.stripItems = await page.locator('.strip-item').count();
  await page.screenshot({ path: 'artifacts/mp-home.png' });

  // 2. Tentang via nav
  await page.locator('header nav').getByRole('link', { name: 'Tentang', exact: true }).click();
  await page.waitForTimeout(900);
  out.tentangHash = await page.evaluate(() => location.hash);
  out.tentangTitle = await page.title();
  out.crumb = (await page.locator('.page-hero-crumb').innerText()).replace(/\s+/g, ' ').trim();
  out.heroIndex = await page.locator('.page-hero-index').innerText();
  out.reasons = await page.locator('.reason-item').count();
  out.reasonOpenFirst = await page.locator('.reason-item').first().getAttribute('open') !== null;
  await page.locator('.reason-item').nth(2).locator('summary').click();
  await page.waitForTimeout(400);
  out.reasonOpensOnClick = await page.locator('.reason-item').nth(2).evaluate((el) => el.open);
  out.legalItems = await page.locator('section[aria-labelledby="legalitas-judul"] li').count();
  await page.screenshot({ path: 'artifacts/mp-tentang.png' });

  // 3. Keutamaan
  await page.goto(BASE + '#/keutamaan', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  out.benefits = await page.locator('.benefit-row').count();
  await page.getByRole('button', { name: 'Putar video penyaluran AmalQu' }).click();
  await page.waitForTimeout(900);
  out.videoDialog = await page.getByRole('dialog').isVisible();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  out.videoClosed = !(await page.getByRole('dialog').isVisible().catch(() => false));

  // 4. Mushaf -> pilih nominal -> diarahkan ke /wakaf
  await page.goto(BASE + '#/mushaf', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  out.priceTiles = await page.locator('.price-tile').count();
  await page.locator('.price-tile').nth(4).click();
  await page.waitForTimeout(1200);
  out.afterPriceHash = await page.evaluate(() => location.hash);
  out.priceToast = (await page.locator('.toast-card').last().innerText()).replace(/\s+/g, ' ').slice(0, 90);
  out.selectValue = await page.locator('#donor-amount').inputValue();
  await page.screenshot({ path: 'artifacts/mp-wakaf-prefilled.png' });

  // 5. Penyaluran tabs + lightbox
  await page.goto(BASE + '#/penyaluran', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  out.tabDokumentasi = await page.locator('.gallery-item').count();
  await page.getByRole('tab', { name: /Bukti transfer/ }).click();
  await page.waitForTimeout(800);
  out.tabBukti = await page.locator('.gallery-item').count();
  await page.locator('.gallery-item').first().click();
  await page.waitForTimeout(600);
  out.lightbox = await page.getByRole('dialog').isVisible();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 6. Wakaf: full flow -> celebration -> nama muncul di papan donasi
  await page.goto(BASE + '#/wakaf', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.locator('#donor-name').fill('Fatih Abdullah');
  await page.locator('#donor-phone').fill('081234567890');
  await page.locator('#donor-dedication').fill('Alm. Ayahanda Abdullah bin Umar');
  await page.getByRole('button', { name: /Bismillah Saya Sedekah Mushaf Al Quran/ }).click();
  await page.waitForTimeout(500);
  out.step2Methods = await page.locator('.method-card').count();
  await page.getByRole('button', { name: /Bayar Sekarang/ }).click();
  await page.waitForTimeout(900);
  out.invoice = ((await page.locator('[role="dialog"]').innerText()).match(/AMQ-[A-Z0-9]{6}/) || [])[0];
  await page.getByRole('button', { name: 'Saya Sudah Bayar' }).click();
  await page.waitForTimeout(2400);
  out.celebration = await page.getByRole('dialog', { name: 'Donasi berhasil' }).isVisible();
  out.phrase = (await page.locator('.celebration-card .font-display.italic').innerText()).replace(/\s+/g, ' ').trim();
  await page.screenshot({ path: 'artifacts/mp-celebration.png' });
  await page.getByRole('button', { name: 'Lihat Papan Donasi' }).click();
  await page.waitForTimeout(1400);
  out.wallHash = await page.evaluate(() => location.hash);
  out.wallName = await page.locator('#papan-donasi .entry-card-new h3').innerText().catch(() => '');
  out.wallTotals = (await page.locator('#papan-donasi dl').innerText()).replace(/\s+/g, ' ').trim();
  await page.screenshot({ path: 'artifacts/mp-wall.png' });

  // 7. Kontak
  await page.goto(BASE + '#/kontak', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  out.contactRows = await page.locator('.contact-row').count();
  out.waHref = await page.locator('.contact-row').first().getAttribute('href');
  out.faq = await page.locator('section[aria-labelledby="faq-judul"] .reason-item').count();
  out.socialPills = await page.locator('.social-pill').count();

  // 8. 404
  await page.goto(BASE + '#/halaman-tidak-ada', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  out.notFound = (await page.locator('h1').innerText()).slice(0, 40);
  out.notFoundChips = await page.locator('.notfound-chip').count();
  await page.locator('.notfound-chip').first().click();
  await page.waitForTimeout(800);
  out.chipNavigates = await page.evaluate(() => location.hash);

  // 9. Deep link langsung + back/forward
  await page.goto(BASE + '#/papan-donasi', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  out.deepLinkWall = await page.locator('.wall-shell').isVisible();
  out.deepLinkNamePersisted = await page.locator('#papan-donasi').getByText('Fatih Abdullah').first().isVisible();
  await page.goBack();
  await page.waitForTimeout(900);
  out.backHash = await page.evaluate(() => location.hash);
  await page.goForward();
  await page.waitForTimeout(900);
  out.forwardHash = await page.evaluate(() => location.hash);

  // 10. Mobile: menu hamburger + alur
  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(BASE, { waitUntil: 'domcontentloaded' });
  await mobile.waitForTimeout(2200);
  await mobile.screenshot({ path: 'artifacts/mp-mobile-home.png' });
  await mobile.getByRole('button', { name: 'Buka menu navigasi' }).click();
  await mobile.waitForTimeout(700);
  out.menuOpen = await mobile.locator('.mobile-menu-open').isVisible();
  out.menuLinks = await mobile.locator('.mobile-menu-link').count();
  await mobile.screenshot({ path: 'artifacts/mp-mobile-menu.png' });
  await mobile.keyboard.press('Escape');
  await mobile.waitForTimeout(600);
  out.menuClosedByEscape = await mobile.evaluate(() => document.querySelector('.mobile-menu').classList.contains('mobile-menu-open') === false);
  await mobile.getByRole('button', { name: 'Buka menu navigasi' }).click();
  await mobile.waitForTimeout(500);
  await mobile.locator('.mobile-menu-link', { hasText: 'Papan Donasi' }).click();
  await mobile.waitForTimeout(1200);
  out.menuNavigates = await mobile.evaluate(() => location.hash);
  out.menuClosedAfterNav = await mobile.evaluate(() => !document.querySelector('.mobile-menu').classList.contains('mobile-menu-open'));
  out.mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await mobile.locator('.page-shell').scrollIntoViewIfNeeded().catch(() => {});
  await mobile.screenshot({ path: 'artifacts/mp-mobile-wall.png' });
  await mobile.goto(BASE + '#/mushaf', { waitUntil: 'domcontentloaded' });
  await mobile.waitForTimeout(1200);
  await mobile.screenshot({ path: 'artifacts/mp-mobile-mushaf.png' });
  out.mobileTilesVisible = await mobile.locator('.price-tile').first().isVisible();

  // 11. Layout kesehatan
  out.skipLinkTarget = await page.locator('#konten').count();
  out.desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  out.brokenImages = await page.locator('img').evaluateAll((imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc).slice(0, 5));
  out.pageErrors = errors.slice(0, 6);
  console.log(JSON.stringify(out, null, 2));
} catch (e) {
  console.log('TEST ERROR:', e.message);
  console.log(JSON.stringify(out, null, 2));
  await page.screenshot({ path: 'artifacts/mp-error.png' }).catch(() => {});
} finally {
  await browser.close();
}
