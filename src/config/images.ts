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
import worldPortrait from '../assets/images/world-portrait.jpg';
import workWebsite from '../assets/images/work-website.jpg';
import workIdentity from '../assets/images/work-identity.jpg';
import workPhotography from '../assets/images/work-photography.jpg';
import workSocial from '../assets/images/work-social.jpg';
import studioPhoto from '../assets/images/studio.jpg';

export interface ImageSlot {
  /** Label shown on the placeholder. */
  label: string;
  /** What kind of image belongs here. Shown on the placeholder. */
  brief: string;
  /** CSS aspect ratio, e.g. '4 / 5'. */
  ratio: string;
  src?: ImageMetadata;
  alt?: string;
  /** Path to a video in `public/`, e.g. '/hero.mp4'. Takes priority over `src`. */
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
    video: '/hero.mp4',
    poster: heroPoster,
    alt: 'A montage of artist work: a photographer shooting a band in a studio, a singer seated in teal haze under stage lights, and an artist website and merchandise on screen.',
  },
  world: {
    label: 'World package image',
    brief: 'Editorial artist portrait with styling and set',
    ratio: '4 / 5',
    src: worldPortrait,
    focus: '50% 30%',
    alt: 'An artist in an oversized black jacket and wide trousers seated on a chrome stool, in a styled set of glass panels, green drapery, and haze.',
  },
  workWebsite: {
    label: 'Artist website preview',
    brief: 'Screenshot or device mockup',
    ratio: '3 / 2',
    src: workWebsite,
    alt: 'An artist website with a dark, green-lit band photo and tour dates, shown on a desktop monitor in a home studio.',
  },
  workIdentity: {
    label: 'Identity preview',
    brief: 'Wordmark, palette, typography',
    ratio: '3 / 2',
    src: workIdentity,
    alt: 'An artist identity laid out on a table: T-shirt, cap, vinyl record, stickers, and a brand sheet with wordmark, color palette, and typefaces.',
  },
  workPhoto: {
    label: 'Photography preview',
    brief: 'Artist photo session selects',
    ratio: '3 / 2',
    src: workPhotography,
    alt: 'A photographer shooting a four-piece band seated together in front of a studio backdrop.',
  },
  workSocial: {
    label: 'Social templates preview',
    brief: 'Branded post and story templates',
    ratio: '3 / 2',
    src: workSocial,
    alt: 'Six square social posts for a band in black, cream, green, and pink, announcing a new single, an EP, and live shows.',
  },
  studio: {
    label: 'Studio photo',
    brief: 'The studio and team at work',
    ratio: '16 / 9',
    src: studioPhoto,
    focus: '50% 60%',
    alt: 'The studio: designers at shared desks editing artwork and photos, with a wall of posters and mood boards and palm trees outside the window.',
  },
} satisfies Record<string, ImageSlot>;

export type ImageKey = keyof typeof slots;
export const images: Record<ImageKey, ImageSlot> = slots;
