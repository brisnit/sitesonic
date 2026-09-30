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
 */
import type { ImageMetadata } from 'astro';

export interface ImageSlot {
  /** Label shown on the placeholder. */
  label: string;
  /** What kind of image belongs here. Shown on the placeholder. */
  brief: string;
  /** CSS aspect ratio, e.g. '4 / 5'. */
  ratio: string;
  src?: ImageMetadata;
  alt?: string;
}

const slots = {
  hero: {
    label: 'Hero image',
    brief: 'Musician portrait or live performance. Crops to 3:2 on tablets, so keep the subject centered.',
    ratio: '4 / 5',
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
