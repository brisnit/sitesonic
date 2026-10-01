// @ts-check
import { defineConfig } from 'astro/config';

// Production domain. Used for canonical
// URLs and absolute social-sharing image URLs.
const SITE_URL = process.env.SITE_URL ?? 'https://sitesonic.online';

export default defineConfig({
  site: SITE_URL,
  build: { inlineStylesheets: 'auto' },
});
