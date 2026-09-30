// Renders public/og.png (1200×630) for social sharing, using the site font.
// Re-run after changing the brand name or tagline:  npm run og
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const src = await readFile(new URL('../src/config/site.ts', import.meta.url), 'utf8');
const name = src.match(/name: '([^']+)'/)[1];
const tagline = src.match(/tagline: '([^']+)'/)[1];
const font = await readFile(
  new URL('../node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2', import.meta.url),
);

const html = `<!doctype html><html><head><style>
@font-face { font-family: A; src: url(data:font/woff2;base64,${font.toString('base64')}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #f5f1e8; color: #16140f; font-family: A; padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; }
.mark { font-weight: 900; font-stretch: 125%; text-transform: uppercase; font-size: 40px; letter-spacing: -0.03em; }
.mark span, .dot { color: #00d28c; }
h1 { font-size: 92px; font-weight: 800; letter-spacing: -0.045em; line-height: 0.95; max-width: 13ch; }
.foot { display: flex; justify-content: space-between; align-items: end; border-top: 2px solid #16140f; padding-top: 22px; font-size: 26px; font-weight: 600; }
.pill { background: #00d28c; padding: 12px 24px; border-radius: 999px; }
</style></head><body>
<div class="mark">${name}<span>.</span></div>
<h1>${tagline}</h1>
<div class="foot"><span>Websites &amp; artist identities for independent musicians</span><span class="pill">3 fixed-price packages</span></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname });
await browser.close();
console.log('Wrote public/og.png');
