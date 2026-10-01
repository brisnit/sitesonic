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

1. **Turn on online requests (Web3Forms).** Go to [web3forms.com](https://web3forms.com), enter **britt@sitesonic.online**, and copy the access key they email you into `intake.web3formsKey` in `src/config/site.ts`. The key is safe to publish. Requests then arrive by email with a descriptive subject, and replying goes straight to the artist.
   - Until a key is set, the form turns each request into a pre-filled email for the artist to send to `intake.fallbackEmail`, so nothing is lost.
   - If sending ever fails, the error message offers the same "Email your request instead" link.
   - To use a different service, leave the key empty and set `PUBLIC_INTAKE_ENDPOINT` in `.env` (a JSON POST of labeled fields).
   - It never shows a success state unless the service confirms delivery.
   - FormSubmit was tried first but its endpoint returned HTTP 500 for every request (2026-09-30).
2. **Payments (Stripe Payment Links).** Each package's `paymentLink` in `src/config/site.ts` points to a Stripe Payment Link. The flow is request first, pay after: once you've confirmed an artist's scope, send them `https://<your-domain>/pay?package=launch` (or `identity` / `world`), which highlights their package. `/pay` isn't linked from the site and is marked `noindex`. To change a price, update both the Stripe product and `price` in the config.
3. **Production URL.** `https://sitesonic.online`, set in `astro.config.mjs` (override with `SITE_URL`). Used for canonical, `og:url`, and `og:image`.
4. **Social links.** Add profile URLs to `socials` in `src/config/site.ts`. The footer's Follow column appears once at least one link is set. Instagram and Facebook matter most.
5. **Meta Pixel.** Paste your Pixel ID into `analytics.metaPixelId` in `src/config/site.ts`. Until then, nothing loads. Events tracked:
   - `PageView` on every page
   - `Lead` when a package request is delivered (with package name and price)
   - `Contact` when a contact message is delivered
   - `InitiateCheckout` when a Pay button on `/pay` is clicked

   Using the pixel means the site needs a privacy policy that discloses it (a Meta requirement).
6. **Supported photo locations.** The copy says "supported locations" generically. List them in the FAQ once they're decided.

Visitors contact you through the footer's "Send us a message" form, which emails the Web3Forms inbox. No address appears on the page. The only place the address appears is the request form's "Email your request instead" fallback, which shows only if sending fails (`intake.fallbackEmail`; set it to `''` to remove).

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
