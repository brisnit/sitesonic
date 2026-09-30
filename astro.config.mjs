// @ts-check
import { defineConfig } from 'astro/config';

// TODO(launch): replace with the real production domain. Used for canonical
// URLs and absolute social-sharing image URLs.
const SITE_URL = process.env.SITE_URL ?? 'https://stagekit.example';

export default defineConfig({
  site: SITE_URL,
  build: { inlineStylesheets: 'auto' },
});
