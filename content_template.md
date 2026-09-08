# Agadir Berbère Expérience — Definitive Content Reference for AI Writers

This file is the single source of truth for producing 100% syntactically correct
Markdown articles. Follow every rule below exactly. When in doubt, copy the
provided examples verbatim and only swap the localized text.

---

## 1. SYSTEM RULES & DIRECTIVES

### 1.1 File location

```text
content/[locale]/blog/[slug].md
```

- `locale` is one of `ar`, `en`, or `fr`.
- `slug` must be lowercase, kebab-case, URL-safe (no spaces, no accents).
- Every article MUST exist in the correct locale folder. Never mix languages
  inside one file.

### 1.2 Image storage convention

- New blog images MUST be placed in:

```text
public/images/blog/[filename].webp
```

- Reference path inside markdown (Nuxt serves `public/` at the site root):

```text
/images/blog/[filename].webp
```

- NEVER include `/public` in the URL.
- Prefer `.webp` for all new images (smaller, faster).
- Existing legacy images hosted on Cloudinary (`https://res.cloudinary.com/...`)
  remain valid and supported. Do not rewrite them.

### 1.3 Strict Localization Rule

- NEVER link to an `/en/` URL inside an Arabic (`/ar/`) or French (`/fr/`)
  article, and vice versa.
- ALL internal links MUST match the article's locale prefix:
  - Arabic article → only `/ar/...` links
  - French article → only `/fr/...` links
  - English article → only `/en/...` links
- The same rule applies to `booking-card`, `info-alert`, and `sitemap.loc`.

---

## 2. EXACT FRONTMATTER SPECIFICATION

Every blog file MUST start with this exact frontmatter block. Copy it and fill
in the localized values. Do not add, rename, or remove keys.

```yaml
---
title: "Localized Article Title Here"
description: "High-intent meta description (150-160 characters) answering search intent directly."
image: "/images/blog/topic-name.webp"
author: "Agadir Berbère Team"
date: "2026-09-08"
sitemap:
  loc: /[locale]/blog/[slug]
---
```

Field rules:

| Field         | Rule                                                                 |
| ------------- | -------------------------------------------------------------------- |
| `title`       | Fully localized headline. 40–60 characters. No locale prefix inside.  |
| `description` | 150–160 characters, answers the search intent directly. Localized.   |
| `image`       | `/images/blog/[filename].webp` for new images, or a full Cloudinary URL for legacy ones. |
| `author`      | Always `"Agadir Berbère Team"` unless told otherwise.                 |
| `date`        | ISO format `YYYY-MM-DD`. Use the article's publish date.              |
| `sitemap.loc` | MUST equal `/[locale]/blog/[slug]` with the real locale and slug.    |

---

## 3. CATALOG OF SERVICES & VERIFIED PRICING (Single Source of Truth)

NEVER invent prices, durations, or URLs. Copy from this catalog only.
Always use the link matching the article's locale.

### Quad Biking

400 MAD (~€38), 2 hours, automatic, coastal dunes & Aghroud forest.

- AR: /ar/experiences/quad-biking
- EN: /en/experiences/quad-biking
- FR: /fr/experiences/quad-biking

### Buggy Safari

600 MAD (~€56) per vehicle (2 seats), 2 hours, standard car license required.

- AR: /ar/experiences/buggy-off-road
- EN: /en/experiences/buggy-off-road
- FR: /fr/experiences/buggy-off-road

### Horse Riding

350 MAD (~€33), 2 hours, Atlantic beach sunset & Aghroud forest.

- AR: /ar/experiences/horse-riding
- EN: /en/experiences/horse-riding
- FR: /fr/experiences/horse-riding

### Camel Trekking & BBQ

300 MAD (~€28), 2 hours, Souss River & forest, family friendly.

- AR: /ar/experiences/camel-trekking
- EN: /en/experiences/camel-trekking
- FR: /fr/experiences/camel-trekking

### Cooking Masterclass

350 MAD (~€33), 4-5 hours, Souk shopping + Tagine & Couscous.

- AR: /ar/experiences/cooking-class
- EN: /en/experiences/cooking-class
- FR: /fr/experiences/cooking-class

### Pottery Workshop

250 MAD (~€24), 2 hours, master artisan training + take-home piece.

- AR: /ar/experiences/pottery-workshop
- EN: /en/experiences/pottery-workshop
- FR: /fr/experiences/pottery-workshop

---

## 4. PROPRIETARY MDC COMPONENTS DIRECTORY & USAGE EXAMPLES

MDC = Markdown Components (Nuxt Content). Two syntaxes exist:

- Inline / self-closing: `:component-name{prop="value"}`
- Block (for components with rich content): `::component-name ... ::`

Rules:

- Props use `key="value"` (strings), `:key='[...]'` for arrays (note the `:`).
- Replace `[locale]` with the article's real locale (`ar`, `en`, or `fr`).
- Place components on their own lines, surrounded by blank lines.

### 4.1 :trust-badges

Displays trust icons: Free Cancellation, Local Guides, 100% Safe.
Takes NO props. Place near the top of the article.

```mdc
:trust-badges
```

### 4.2 :image-gallery

Array of image URLs (local `/images/blog/...` or full Cloudinary URLs).

```mdc
:image-gallery{:images='["/images/blog/pic1.webp", "/images/blog/pic2.webp"]'}
```

### 4.3 :booking-card

Call-to-action card. `price` is a display string, `link` must be localized.

```mdc
:booking-card{title="Experience Title" price="400 MAD" link="/[locale]/experiences/[slug]"}
```

Example (English quad article):

```mdc
:booking-card{title="Sunset Quad Biking" price="400 MAD" link="/en/experiences/quad-biking"}
```

### 4.4 :group-promo

Group/family offer banner. `discountAmount` is a NUMBER (no quotes, no currency).

```mdc
:group-promo{title="عرض المجموعات والعائلات" discountAmount="50" condition="عند حجز 4 أشخاص أو أكثر"}
```

English example:

```mdc
:group-promo{title="Groups & Families Offer" discountAmount="50" condition="When booking for 4 or more people"}
```

### 4.5 :info-alert

Highlighted note box for crucial advice or scam warnings.

```mdc
:info-alert{title="Important Note" text="Crucial advice or scam warning here." link="/[locale]#services"}
```

Omit `link` when no link is needed:

```mdc
:info-alert{title="Good to Know" text="Free hotel pickup is included in Agadir and Taghazout."}
```

### 4.6 :share-buttons

WhatsApp, Facebook, X sharing icons. Takes NO props.

```mdc
:share-buttons
```

### 4.7 :social-embed

Embeds a social video. `platform` is one of `youtube`, `tiktok`, `instagram`.
`id` is the video/post ID only (never a full URL).

```mdc
:social-embed{platform="youtube" id="VIDEO_ID"}
```

```mdc
:social-embed{platform="tiktok" id="VIDEO_ID"}
```

```mdc
:social-embed{platform="instagram" id="POST_ID"}
```

### 4.8 Standard Markdown Tables

Write normal GitHub-flavored Markdown tables. They are AUTOMATICALLY rendered
via `components/content/ProseTable.vue` with responsive glassmorphism, mobile
horizontal scroll, and RTL support. No special syntax needed.

```md
| Detail | Info |
| --- | --- |
| **Duration** | 2 hours (including transport) |
| **Price** | 400 MAD per person |
| **Pickup** | Free hotel pickup (Agadir & Taghazout) |
```

Rules for tables:

- Always include the header separator row (`| --- | --- |`).
- Use `**bold**` for label cells in detail tables.
- Never set widths or HTML attributes; styling is fully automatic.

### 4.9 ::comparison-table (advanced luxury comparisons)

Side-by-side feature comparison with badges, prices, and winner highlights.
Block syntax with YAML props. `winner` per row is one of `col1` (highlights
the first option cell), `col2` (highlights the second option cell), or
`equal` (highlights both).

```mdc
::comparison-table
---
title: "Quad vs Buggy: Which One Is for You?"
subtitle: "Honest comparison from local guides."
col1Header: "Feature"
col2Header: "Quad"
col3Header: "Buggy"
col2Badge: "Most Popular"
col3Badge: "Couples' Choice"
col2Price: "400 MAD"
col3Price: "600 MAD"
items:
  - label: "Duration"
    val1: "2 hours"
    val2: "2 hours"
    winner: "equal"
  - label: "Sensation"
    val1: "Solo riding freedom"
    val2: "Shared 2-seater thrill"
    winner: "col1"
---
::
```

- All header/badge/price props are optional; defaults are bilingual
  (`الميزة / Feature`, `الكواد / Quad`, `الباغي / Buggy`).
- Omit `winner` on a row for a neutral comparison.
- Localize EVERY visible string to the article's locale.

### 4.10 :map-embed

Official Google Maps embed of the Kasbat Souss basecamp. Use it anywhere in
an article with zero raw HTML — typically in a "How to Find Us / Getting
There" section. Takes NO required props; `title` is optional, `src` overrides
the location only when a different place is intentionally required.

```mdc
:map-embed
```

```mdc
:map-embed{title="Where to Find Us in Kasbat Souss"}
```

---

## 5. HOW TO ADD FUTURE CUSTOM COMPONENTS (Developer Note)

For AI and human developers extending the system:

1. Create the component at `components/content/NewComponent.vue` using
   `<script setup lang="ts">` with typed props:

```vue
<template>
  <div class="new-component" v-if="title">{{ title }}</div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
```

2. Style it with the brand tokens (`var(--accent)`, `var(--glass-border)`,
   `var(--text-primary)`, `var(--text-secondary)`, `var(--font-heading)`)
   so it matches the glassmorphism system.
3. Components in `components/content/` are auto-registered globally by Nuxt,
   which makes the MDC tag (`:new-component`) resolve on the client.
4. For SSR-safe server rendering, ALSO map it explicitly in the page bindings:

```ts
// pages/blog/[slug].vue (and pages/experiences/[slug].vue if needed)
import ContentNewComponent from '~/components/content/NewComponent.vue'

const mdcComponents = {
  'booking-card': ContentBookingCard,
  'comparison-table': ContentComparisonTable,
  'new-component': ContentNewComponent,
}
```

5. The MDC tag name is the kebab-case file name: `NewComponent.vue` →
   `:new-component`. `Prose*.vue` names are reserved: they override default
   Markdown renderers (e.g. `ProseTable.vue` overrides all `| tables |`).
6. Run `npm run build` and confirm a clean SSR bundle with zero errors.

---

## 6. FULL MINIMAL ARTICLE SKELETON (Copy & Adapt)

```md
---
title: "Localized Article Title Here"
description: "High-intent meta description (150-160 characters) answering search intent directly."
image: "/images/blog/topic-name.webp"
author: "Agadir Berbère Team"
date: "2026-09-08"
sitemap:
  loc: /en/blog/topic-slug
---

:trust-badges

Intro paragraph answering the search intent in 2-3 sentences.

:image-gallery{:images='["/images/blog/topic-1.webp", "/images/blog/topic-2.webp"]'}

## Section Heading

Body text with an internal link like [Sunset Quad Biking](/en/experiences/quad-biking).

| Detail | Info |
| --- | --- |
| **Price** | 400 MAD per person |

:booking-card{title="Sunset Quad Biking" price="400 MAD" link="/en/experiences/quad-biking"}

:share-buttons
```
