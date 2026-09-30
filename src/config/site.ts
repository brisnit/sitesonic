/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITESONIC — central site content
 * ─────────────────────────────────────────────────────────────────────────────
 *  Nearly every word on the site lives here. Edit this file to change the brand
 *  name, packages, prices, FAQ, team, contact details, and social links.
 *  Images live in `src/config/images.ts`.
 *
 *  Anything marked TODO still needs real information before launch.
 */

// ── Brand ────────────────────────────────────────────────────────────────────
// Changing `name` updates the header, footer,
// page title, social metadata, and every sentence that mentions the studio.
export const brand = {
  name: 'SiteSonic',
  tagline: 'Your sound. Your identity. Your next stage.',
  description:
    'Websites, branding, and artist identities for independent musicians. Three fixed-price packages, from a simple artist website to a complete identity and launch system.',
  locale: 'en_US',
  currency: 'USD',
};

const B = brand.name;

// ── Contact & social ────────────────────────────────────────────────────────
// TODO(launch): add a real contact email. While empty, the footer shows a
// clearly marked placeholder instead of a link.
export const contact = {
  email: '',
  placeholder: 'Contact email coming soon',
};

// TODO(launch): add profile URLs. Entries with an empty `href` render as
// labelled placeholders, not links.
export const socials: { label: string; href: string }[] = [
  { label: 'Instagram', href: '' },
  { label: 'TikTok', href: '' },
  { label: 'YouTube', href: '' },
];

// ── Navigation ──────────────────────────────────────────────────────────────
export const nav = [
  { label: 'Packages', href: '#packages' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'The studio', href: '#studio' },
  { label: 'FAQ', href: '#faq' },
];

export const primaryCta = { label: 'Choose your package', href: '#packages' };

// ── Hero ────────────────────────────────────────────────────────────────────
export const hero = {
  headline: ['You’ve got the sound.', 'Let’s build the world around it.'],
  body: 'Websites, branding, and artist identities for independent musicians. Pick your package and give your music a home.',
  primary: primaryCta,
  secondary: { label: 'How it works', href: '#how-it-works' },
};

// ── Introduction ────────────────────────────────────────────────────────────
export const intro = {
  headline: 'Make it easier for people to find you, follow you, and support your music.',
  body: [
    `Right now your music might live on one platform, your shows on another, your merch somewhere else, and your story nowhere at all. ${B} brings it together.`,
    'We shape your music, story, shows, merchandise, and visual identity into one cohesive digital presence, so the people who hear you once know exactly where to go next.',
  ],
  pillars: ['Music', 'Story', 'Shows', 'Merch', 'Identity'],
};

// ── Packages ────────────────────────────────────────────────────────────────
export type PackageId = 'launch' | 'identity' | 'world';

export interface Package {
  id: PackageId;
  name: string;
  /** One-time project fee in whole currency units. */
  price: number;
  tagline: string;
  audience: string;
  includes: string[];
  cta: string;
  /** Stripe Payment Link. Shared with artists after scope is confirmed (see /pay). */
  paymentLink: string;
  /** Gives the package the accent treatment. */
  featured?: boolean;
}

export const packages: Package[] = [
  {
    id: 'launch',
    name: 'Launch',
    price: 500,
    tagline: 'A proper home for your music.',
    audience: 'For artists who already have a logo, photos, and music ready to share.',
    includes: [
      'Mobile-friendly one-page artist website',
      'Bio, music, video, shows, and contact sections',
      'Streaming links and embedded music player',
      'Shop setup with up to five products',
      'Email signup connected to your chosen platform',
      'Basic SEO: title, description, image descriptions, and indexing setup',
      'Styling using your existing brand assets',
      'One consolidated revision round',
      'Website handoff guide',
    ],
    cta: 'Choose Launch',
    paymentLink: 'https://buy.stripe.com/3cI7sM5DtadY9adgWY3AY02',
  },
  {
    id: 'identity',
    name: 'Identity',
    price: 1500,
    tagline: 'Make your look match your sound.',
    audience: 'For artists who want a recognizable, consistent visual identity.',
    includes: [
      'Website with up to four pages',
      'Shop setup with up to ten products',
      'Basic SEO',
      'Creative kickoff session',
      'One focused visual direction',
      'Artist wordmark, color palette, and typography system',
      'Concise brand guide',
      'Refined artist bio and positioning statement',
      'Three editable social templates',
      'Website or release launch checklist',
      'Two consolidated revision rounds',
    ],
    cta: 'Choose Identity',
    paymentLink: 'https://buy.stripe.com/14A7sM4zp3PA8696ik3AY01',
  },
  {
    id: 'world',
    name: 'World',
    price: 3000,
    tagline: 'Build the world around your music.',
    audience: 'For artists ready for a complete identity and a practical system for launching it.',
    includes: [
      'Website with up to six pages',
      'Shop setup with up to fifteen products',
      'Artist discovery workshop',
      'Full visual identity and creative direction',
      'Artist story, voice, and persona development',
      'Optional lore for fictional or theatrical artist worlds',
      'One planned photo session with ten edited images',
      'Digital press kit',
      'Expanded SEO and search indexing setup',
      'Marketing strategy and three to five content pillars',
      'Six editable social templates',
      'A 30-day posting plan',
      'Handoff session',
      'Two consolidated revision rounds',
    ],
    cta: 'Start your artist identity',
    paymentLink: 'https://buy.stripe.com/28E14o7LBcm65Y1dKM3AY00',
    featured: true,
  },
];

export const packagesSection = {
  headline: 'Three packages. One fixed price each.',
  body: 'Pick the one that fits where you are now. Every package ends with a site you can share and a clear handoff.',
  notes: [
    {
      title: 'Pricing',
      body: 'All prices are one-time project fees. Domain, hosting, platform subscriptions, payment processing, and ongoing services are separate.',
    },
    {
      title: 'Photography',
      body: 'Photo sessions are available in supported locations. Elsewhere, we arrange a photographer credit with remote creative direction or provide a separate quote. Coverage is confirmed before payment.',
    },
    {
      title: 'Schedule',
      body: 'Your project schedule is confirmed after we review your music, images, and materials, so the timeline reflects what you actually need.',
    },
  ],
};

// ── World feature ───────────────────────────────────────────────────────────
export const worldFeature = {
  eyebrow: 'The World package',
  headline: 'More than a website. A world people recognize.',
  body: [
    'We work with you to connect your sound, look, story, photography, and social presence, so every place someone meets your music feels like the same artist.',
    'You leave with a cohesive identity and a repeatable system for showing up online: templates, content pillars, and a posting plan you can keep using long after launch.',
  ],
  threads: ['Sound', 'Look', 'Story', 'Photography', 'Social presence'],
  cta: 'Start your artist identity',
};

// ── Work preview ────────────────────────────────────────────────────────────
// Images and alt text live in `src/config/images.ts`.
export const work = {
  headline: 'The work',
  body: 'Websites, identities, photography, and social templates, designed to work together as one presence.',
  items: [
    { key: 'workWebsite', label: 'Artist website preview', caption: 'Artist websites' },
    { key: 'workIdentity', label: 'Identity preview', caption: 'Visual identities' },
    { key: 'workPhoto', label: 'Photography preview', caption: 'Photography' },
    { key: 'workSocial', label: 'Social templates preview', caption: 'Branded social templates' },
  ] as const,
};

// ── How it works ────────────────────────────────────────────────────────────
export const howItWorks = {
  headline: 'How it works',
  steps: [
    {
      title: 'Choose your package',
      body: 'Pick Launch, Identity, or World and send a short request. We confirm availability, scope, and next steps.',
    },
    {
      title: 'Send your music, images, and materials',
      body: 'Share your music, photos, logo, bio, show dates, and products, whatever you already have.',
    },
    {
      title: 'Collaborate with our creative team',
      body: 'We shape the direction with you, share the work in progress, and refine it through your included revision rounds.',
    },
    {
      title: 'Launch with everything in place',
      body: 'Your site goes live with your music, story, and shop connected, plus a handoff so you know how it all works.',
    },
  ],
  note: 'Work begins once we have received the materials your package needs. Your schedule is confirmed at that point.',
};

// ── The studio ──────────────────────────────────────────────────────────────
// The studio photo lives in `src/config/images.ts` (the `studio` slot).
export const studio = {
  headline: 'Real people helping you bring your music into focus.',
  body: `${B} is a small team working across design, branding, photography, and marketing strategy. You work directly with the people making your site and identity.`,
};

// ── FAQ ─────────────────────────────────────────────────────────────────────
export const faq = {
  headline: 'Questions',
  items: [
    {
      q: `Who is ${B} for?`,
      a: `Independent and local musicians, solo artists, bands, producers, and performers, who want a professional home online. Whether you are releasing your first single or your fifth record, the packages are built to meet you where you are.`,
    },
    {
      q: 'Do I need an existing logo or photos?',
      a: 'For Launch, yes. It is designed for artists who already have a logo, photos, and music ready, and we style the site using those assets. Identity creates your wordmark, palette, and typography. World adds a planned photo session as well as a full visual identity.',
    },
    {
      q: 'Can I sell merch or digital products?',
      a: 'Yes. Every package includes shop setup: up to five products with Launch, ten with Identity, and fifteen with World. You supply the products and handle fulfillment. Which digital products you can sell, such as downloads, depends on the commerce platform you choose.',
    },
    {
      q: 'Are hosting and domain costs included?',
      a: 'No. Package prices are one-time project fees. Your domain, hosting, platform subscriptions, and payment processing fees are separate and paid directly to those providers, so everything stays in your name.',
    },
    {
      q: 'Can I update my website afterward?',
      a: 'Yes, that is the goal of the handoff. How you edit depends on the platform your site is delivered on, so we confirm exactly what you will be able to change yourself once the platform is chosen.',
    },
    {
      q: 'What does basic versus expanded SEO include?',
      a: 'Basic SEO covers the essentials: page titles, descriptions, image descriptions, and indexing setup so search engines can find your site. Expanded SEO (World) adds page-specific optimization across your site and guidance for future content. Neither guarantees search rankings.',
    },
    {
      q: 'Is the photo session available in my city?',
      a: 'Photo sessions are available in supported locations. If you are elsewhere, we can arrange a photographer credit with remote creative direction, or provide a separate quote. Either way, coverage is confirmed with you before payment.',
    },
    {
      q: 'What is artist lore?',
      a: 'Some artists perform as a character or build a fictional or theatrical world around their music. Lore is the backstory, setting, and rules of that world. It is an optional part of World, for artists who want it.',
    },
    {
      q: 'Will you manage my social accounts?',
      a: 'No. We give you the templates, content pillars, and plan (plus a 30-day posting plan with World) so you can post with confidence. Ongoing posting, advertising, and community management are separate services.',
    },
    {
      q: 'What happens if I need more pages or revisions?',
      a: 'No problem. Additional pages, products, or revision rounds are quoted before any extra work begins, so there are no surprises on your bill.',
    },
    {
      q: 'When does my project begin?',
      a: 'After we confirm availability and scope, and once we have received the materials your package needs. We confirm your schedule after reviewing those materials.',
    },
  ],
};

// ── Final call to action ────────────────────────────────────────────────────
export const finalCta = {
  headline: 'Give your music a home.',
  body: 'Start with a website. Build your identity. Create your world.',
  cta: primaryCta,
};

// ── Intake form ─────────────────────────────────────────────────────────────
export const intake = {
  /**
   * Where package requests go. Web3Forms (web3forms.com) emails each request
   * to the inbox the access key was created for. Get a free key by entering
   * britt@sitesonic.online at web3forms.com; it's safe to publish.
   * With no key, `endpoint` (or PUBLIC_INTAKE_ENDPOINT) is used instead, as a
   * plain JSON POST. With neither, the form says it isn't connected.
   * Success is only ever shown when delivery is confirmed.
   */
  web3formsKey: '6e9e9c88-7a8e-40a7-bafb-11bff6c0f78f',
  endpoint: (import.meta.env.PUBLIC_INTAKE_ENDPOINT ?? '').trim(),
  /** Offered as an "email instead" link if sending fails. */
  fallbackEmail: 'britt@sitesonic.online',
  title: 'Request a package',
  intro:
    'Tell us about your music. We’ll review your request, confirm availability, scope, and schedule, then send checkout details. No payment is taken here.',
  submitLabel: 'Request this package',
  materials: ['Logo', 'Photos', 'Artist bio', 'Released or finished music', 'Music videos', 'Products or merch designs'],
  helpWith: [
    'Artist website',
    'Visual identity',
    'Bio and story',
    'Photography',
    'Social templates',
    'Marketing plan',
    'Online shop',
  ],
  success: {
    title: 'Request received.',
    body: 'Thanks. We’ll review your request and reply by email to confirm availability, scope, and schedule. Checkout follows once everything is agreed.',
  },
  notConnected: {
    title: 'One more step: send it by email.',
    body: 'Online requests aren’t switched on yet, so this hasn’t been sent. Use “Email this request” and your answers will be filled in, or copy them below.',
  },
};

// ── Payment page (/pay) ─────────────────────────────────────────────────────
// Not linked from the site and hidden from search engines. Send artists
// /pay (or /pay?package=world to highlight theirs) once scope is confirmed.
export const payPage = {
  title: 'Pay for your package',
  body: 'Use this page once we’ve confirmed your project’s scope and schedule by email. Payment is handled securely by Stripe.',
  notes: [
    'All prices are one-time project fees. Domain, hosting, platform subscriptions, payment processing, and ongoing services are separate.',
    'Photo session coverage for World is confirmed with you before payment.',
  ],
  notYet: 'Haven’t sent a request yet? Start there, and we’ll confirm availability before you pay.',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: brand.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
