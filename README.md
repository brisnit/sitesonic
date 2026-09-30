# SiteSonic site

Marketing site and package storefront for SiteSonic, a creative studio for independent musicians. It is one landing page with anchored sections and a package request form.

Built with [Astro](https://astro.build) as a static site. It ships almost no JavaScript: only the menu, scroll reveal, and request form.

## Commands

| Command           | What it does                                          |
| ----------------- | ----------------------------------------------------- |
| `npm install`     | Install dependencies                                  |
| `npm run dev`     | Local dev server at http://localhost:4321             |
| `npm run build`   | Type-check, then build the static site into `dist/`   |
| `npm run preview` | Serve the production build locally                    |
| `npm run og`      | Regenerate the social sharing image (`public/og.png`) |

## Editing content

| What                                                                                 | Where                                                |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Brand name, tagline, all copy, packages and prices, FAQ, contact, social links        | `src/config/site.ts`                                 |
| Images and hero video (hero, World feature, work previews, studio photo)             | `src/config/images.ts` + files in `src/assets/images/` |
| Colors, type scale, spacing                                                          | `:root` in `src/styles/global.css`                   |
| Page section order                                                                   | `src/pages/index.astro`                              |

Changing `brand.name` updates it everywhere, including the footer wordmark, which resizes to fit. Then run `npm run og` to refresh the sharing image.

### Replacing image placeholders

Each image is a named slot with a set aspect ratio. Until a slot has a file, it renders as a labeled placeholder.

1. Put the image in `src/assets/images/` (at least 2400px on the long edge for large slots).
2. In `src/config/images.ts`, import it and set `src` and `alt` on the slot:

   ```ts
   import heroPhoto from '../assets/images/hero.jpg';
   // ...
   hero: { label: 'Hero image', brief: '…', ratio: '4 / 5', src: heroPhoto, alt: 'Describe the photo' },
   ```

Astro resizes the image and serves AVIF/WebP automatically.

### The hero video

The hero plays `public/hero.mp4` (muted, looped) over a poster frame at `src/assets/images/hero-poster.jpg`. It pauses when scrolled off screen, has a pause/play button, and isn't downloaded at all for visitors who prefer reduced motion (they see the poster).

To swap the video: replace `public/hero.mp4`, then replace the poster with a still of the new video's **first frame** so there's no jump when playback starts. Crop and alt text are the `hero` slot's `focus` and `alt` in `src/config/images.ts`. Keep hero videos short (around 10 s) and under ~3 MB. Avoid letterboxed (black-bar) shots, since the hero crops the sides and the bars would show. The file doesn't need an audio track, since it always plays muted.

With [ffmpeg](https://ffmpeg.org), this re-encodes a video for the web and grabs its first frame as the poster:

```sh
ffmpeg -i new-video.mp4 -an -c:v libx264 -profile:v high -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart public/hero.mp4
ffmpeg -i public/hero.mp4 -frames:v 1 -q:v 2 src/assets/images/hero-poster.jpg
```

### Source files

Photos in `src/assets/images/` are high-quality JPEGs (use JPEG or WebP sources for photos: a PNG source makes the build emit large PNG fallbacks). Original, unoptimized files are kept locally in `source-media/`, which is git-ignored and never shipped.

## Before launch: what still needs configuring

Search the code for `TODO(launch)`.

1. **Activate request emails (one time).** Package requests are emailed to **britt@sitesonic.online** via [FormSubmit](https://formsubmit.co) (set in `intake.endpoint`, `src/config/site.ts`). The first request anyone sends triggers an activation email to that inbox. Nothing is delivered until you click **Activate Form** in it. Until then, visitors see "Your request couldn't be sent," never a false success.
   - After activating, FormSubmit emails you a random alias string. Swap it in for the address in the endpoint (`https://formsubmit.co/ajax/<alias>`) to keep your email out of the page source and reduce spam.
   - To use a different service (Formspree, Basin, your own function), set `PUBLIC_INTAKE_ENDPOINT` in `.env`. It receives a JSON POST of labeled fields.
   - It never shows a success state unless the service confirms delivery.
2. **Payments (Stripe Payment Links).** Each package's `paymentLink` in `src/config/site.ts` points to a Stripe Payment Link. The flow is request first, pay after: once you've confirmed an artist's scope, send them `https://<your-domain>/pay?package=launch` (or `identity` / `world`), which highlights their package. `/pay` isn't linked from the site and is marked `noindex`. To change a price, update both the Stripe product and `price` in the config.
3. **Production URL.** Set `SITE_URL` (in `.env` or `astro.config.mjs`) for canonical and social image URLs.
4. **Contact email and social links.** In `src/config/site.ts` (`contact`, `socials`). Empty values render as labeled placeholders.
5. **Supported photo locations.** The copy says "supported locations" generically. List them in the FAQ once they're decided.

## Request payload

```json
{
  "package": { "id": "world", "name": "World", "price": 3000 },
  "artistName": "", "contactName": "", "email": "", "location": "",
  "links": ["https://…"],
  "photography": { "need": "yes | no | unsure", "location": "" },
  "materials": ["Logo", "Photos"],
  "helpWith": ["Artist website"],
  "launchDate": "2027-03-01",
  "description": "",
  "submittedAt": "ISO timestamp",
  "page": "URL the form was sent from"
}
```

`photography` is only present for World. A hidden honeypot field (`company_website`) filters simple bots.

## Deep links

`/?package=launch`, `/?package=identity`, or `/?package=world` opens the request form with that package selected. This is handy for links in DMs and bios.
