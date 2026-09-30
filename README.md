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

1. **Inquiry endpoint (required for real requests).** Set `PUBLIC_INTAKE_ENDPOINT` in `.env` (see `.env.example`). The form POSTs JSON to it. Formspree, Basin, Getform, or your own serverless function all work. Until it is set:
   - the form shows a "Requests aren't connected yet" notice;
   - submitting shows "This form isn't connected yet. Your request was not sent," with a copy-able summary.

   It never shows a success state unless the endpoint returns a 2xx response.
2. **Payments.** Not integrated, by design. The form is a request ("Request this package"), and checkout follows once availability and scope are confirmed. When you are ready, send a payment link (Stripe Payment Links, Square, etc.) in your reply, or add checkout as a later step.
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
