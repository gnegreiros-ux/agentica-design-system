import { html } from 'lit';
// Local, bundled fixtures (not a remote placeholder service): Chromatic's
// capture browser doesn't reliably fetch third-party images, so every story
// using picsum.photos snapshotted blank (issue 151). Each fixture prints its
// own format, so the WebP story shows which source the browser picked.
import landscapeJpg from './fixtures/landscape.jpg';
import landscapeWebp from './fixtures/landscape.webp';
import wideJpg from './fixtures/wide.jpg';

/** @type { import('@storybook/web-components').Meta } */
export default {
  title: 'Components/agtc-image',
  component: 'agtc-image',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'UX reference patterns applied (ADR-036, all approved):',
          '',
          '- **Decorative vs meaningful image distinction** (`alt=""` + `aria-hidden`), mirrors the pattern already approved on `agtc-icon` — WCAG 1.1.1 / [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/)',
          '- **Skeleton screen while loading** (opt-in) — [NN/g — Skeleton Screens 101](https://www.nngroup.com/articles/skeleton-screens/)',
          '- **Graceful fallback on load failure** — icon + visible alt text instead of a broken-image hole',
          '- **`object-fit` configurable** (`cover`/`contain`/`fill`) for consistent cropping behavior',
          '',
          'Details: `guidelines/components/image.md` § UX Patterns Reference.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    src:        { control: 'text' },
    srcWebp:    { control: 'text', name: 'src-webp' },
    alt:        { control: 'text' },
    decorative: { control: 'boolean' },
    width:      { control: 'number' },
    height:     { control: 'number' },
    fit:        { control: 'select', options: ['cover', 'contain', 'fill'], table: { defaultValue: { summary: 'cover' } } },
    priority:   { control: 'boolean' },
    skeleton:   { control: 'boolean' },
  },
  args: {
    src: landscapeJpg,
    alt: 'Placeholder photo',
    width: 800,
    height: 450,
    fit: 'cover',
  },
  render: (args) => html`
    <div style="max-width:480px">
      <agtc-image
        src="${args.src}"
        src-webp="${args.srcWebp ?? ''}"
        alt="${args.decorative ? '' : (args.alt ?? '')}"
        ?decorative="${args.decorative}"
        width="${args.width}"
        height="${args.height}"
        fit="${args.fit}"
        ?priority="${args.priority}"
        ?skeleton="${args.skeleton}"
      ></agtc-image>
    </div>
  `,
};

// ── Basic ────────────────────────────────────────────────────────────────────

export const Default = {
  name: 'Default — lazy, no skeleton',
  render: () => html`
    <div style="max-width:480px">
      <agtc-image
        src="${landscapeJpg}"
        alt="A placeholder photo"
        width="800"
        height="450"
      ></agtc-image>
    </div>
  `,
};

export const WithSkeleton = {
  name: 'Skeleton — opt-in loading placeholder',
  render: () => html`
    <div style="max-width:480px">
      <agtc-image
        src="${landscapeJpg}"
        alt="A placeholder photo, with a skeleton shown until it loads"
        width="800"
        height="450"
        skeleton
      ></agtc-image>
    </div>
  `,
};

export const Priority = {
  name: 'Priority — LCP / above-the-fold image',
  render: () => html`
    <div style="max-width:480px">
      <agtc-image
        src="${landscapeJpg}"
        alt="Hero image, loaded eagerly with high fetch priority"
        width="1200"
        height="630"
        priority
      ></agtc-image>
    </div>
  `,
};

// ── Object-fit ───────────────────────────────────────────────────────────────

export const ObjectFit = {
  name: 'object-fit — cover / contain / fill',
  render: () => html`
    <div style="display:flex;gap:var(--agtc-semantic-space-component-padding-lg);flex-wrap:wrap">
      <div style="width:220px">
        <p style="font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">cover</p>
        <agtc-image src="${wideJpg}" alt="Wide photo, cropped to fill a square" width="220" height="220" fit="cover"></agtc-image>
      </div>
      <div style="width:220px">
        <p style="font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">contain</p>
        <agtc-image src="${wideJpg}" alt="Wide photo, letterboxed in a square" width="220" height="220" fit="contain"></agtc-image>
      </div>
      <div style="width:220px">
        <p style="font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin:0 0 8px;">fill</p>
        <agtc-image src="${wideJpg}" alt="Wide photo, stretched to fill a square" width="220" height="220" fit="fill"></agtc-image>
      </div>
    </div>
  `,
};

// ── Accessibility ────────────────────────────────────────────────────────────

export const Decorative = {
  name: 'Decorative — alt="" + aria-hidden',
  render: () => html`
    <div style="max-width:320px">
      <agtc-image
        src="${wideJpg}"
        decorative
        width="600"
        height="300"
      ></agtc-image>
    </div>
  `,
};

export const BrokenImage = {
  name: 'Error state — fallback on failed load',
  render: () => html`
    <div style="max-width:320px">
      <agtc-image
        src="https://this-domain-does-not-exist.invalid/broken.jpg"
        alt="A photo that fails to load"
        width="600"
        height="300"
      ></agtc-image>
    </div>
  `,
};

// ── WebP ─────────────────────────────────────────────────────────────────────

export const WebpWithFallback = {
  name: 'WebP source + fallback format',
  render: () => html`
    <div style="max-width:480px">
      <agtc-image
        src="${landscapeJpg}"
        src-webp="${landscapeWebp}"
        alt="Photo served as WebP where supported, JPEG fallback otherwise"
        width="800"
        height="450"
      ></agtc-image>
    </div>
  `,
};
