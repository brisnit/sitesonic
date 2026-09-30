/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Image slots
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every image on the site is a slot. With no `src`, a slot renders as a
 *  labelled placeholder at its intended aspect ratio.
 *
 *  To add a real image:
 *    1. Put the file in `src/assets/images/` (JPG or PNG, at least 2400px on
 *       the long edge for full-width slots).
 *    2. Import it at the top of this file:
 *         import heroPhoto from '../assets/images/hero.jpg';
 *    3. Set it on the slot and write real alt text:
 *         hero: { ...,  src: heroPhoto, alt: 'Artist name performing live at…' },
 *
 *  Astro resizes and converts images to modern formats at build time.
 *
 *  A slot can hold a video instead: put the file in `public/`, set `video` to
 *  its path, and give it a `poster` (a still from the first frame, shown while
 *  loading and to visitors who prefer reduced motion). Videos play muted and
 *  looped, with a pause button.
 */
import type { ImageMetadata } from 'astro';
import heroPoster from '../assets/images/hero-poster.jpg';

export interface ImageSlot {
  /** Label shown on the placeholder. */
  label: string;
  /** What kind of image belongs here. Shown on the placeholder. */
  brief: string;
  /** CSS aspect ratio, e.g. '4 / 5'. */
  ratio: string;
  src?: ImageMetadata;
  alt?: string;
  /** Path to a video in `public/`, e.g. '/Hero.mp4'. Takes priority over `src`. */
  video?: string;
  /** Still frame for the video. */
  poster?: ImageMetadata;
  /** CSS object-position for cropping, e.g. '55% 40%'. Defaults to center. */
  focus?: string;
}

const slots = {
  hero: {
    label: 'Hero image',
    brief: 'Musician portrait or live performance',
    // Landscape source: shown 5:4 on desktop, 16:9 on tablet, 4:3 on phones.
    ratio: '5 / 4',
    video: '/Hero.mp4',
    poster: heroPoster,
    focus: '56% 40%',
    alt: 'A musician playing an acoustic guitar on a dark stage lit in teal, with smoke drifting behind.',
  },
  world: {
    label: 'World package image',
    brief: 'Editorial artist portrait with styling and set',
    ratio: '4 / 5',
  },
  workWebsite: { label: 'Artist website preview', brief: 'Screenshot or device mockup', ratio: '16 / 10' },
  workIdentity: { label: 'Identity preview', brief: 'Wordmark, palette, typography', ratio: '4 / 5' },
  workPhoto: { label: 'Photography preview', brief: 'Artist photo session selects', ratio: '4 / 5' },
  workSocial: { label: 'Social templates preview', brief: 'Branded post and story templates', ratio: '16 / 10' },
  team1: { label: 'Team photo', brief: 'Portrait', ratio: '4 / 5' },
  team2: { label: 'Team photo', brief: 'Portrait', ratio: '4 / 5' },
  team3: { label: 'Team photo', brief: 'Portrait', ratio: '4 / 5' },
  team4: { label: 'Team photo', brief: 'Portrait', ratio: '4 / 5' },
} satisfies Record<string, ImageSlot>;

export type ImageKey = keyof typeof slots;
export const images: Record<ImageKey, ImageSlot> = slots;
