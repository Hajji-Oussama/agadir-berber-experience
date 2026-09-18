<template>
  <article
    class="experience-admin-card"
    :aria-labelledby="`exp-title-${exp.slug}`"
  >
    <div class="exp-cover">
      <img
        v-if="exp.image"
        :src="exp.image"
        :alt="exp.title"
        class="exp-thumb"
        loading="lazy"
        width="400"
        height="220"
      />
      <span v-else class="exp-thumb exp-thumb--empty" aria-hidden="true">
        <AdminIcon name="compass" :size="40" />
      </span>

      <!-- Floating price pill with glowing border -->
      <span v-if="exp.price != null" class="exp-price-badge">
        <AdminIcon name="tag" :size="14" />
        <span>{{ exp.price }} MAD</span>
        <span v-if="exp.priceEur != null" class="exp-price-eur">≈ €{{ exp.priceEur }}</span>
      </span>

      <!-- Frosted hover overlay: quick image swap -->
      <div class="exp-cover-overlay">
        <button
          type="button"
          class="exp-overlay-btn"
          :disabled="swapping"
          :aria-label="swapping ? `Updating image for ${exp.slug}` : `Change cover image for ${exp.slug}`"
          @click="emit('swap', exp, primaryLocale)"
        >
          <AdminIcon :name="swapping ? 'refresh' : 'image'" :size="16" :class="{ 'is-spinning': swapping }" />
          <span>{{ swapping ? 'Saving…' : 'Change image' }}</span>
        </button>
      </div>
    </div>

    <div class="exp-body">
      <h3 :id="`exp-title-${exp.slug}`" class="exp-title" dir="auto">{{ exp.title }}</h3>
      <code class="exp-slug" dir="ltr">/experiences/{{ exp.slug }}</code>

      <!-- Specs row: micro-chip grid -->
      <dl class="exp-specs">
        <div v-if="exp.duration" class="exp-spec">
          <dt><AdminIcon name="clock" :size="14" /><span>Duration</span></dt>
          <dd dir="auto">{{ exp.duration }}</dd>
        </div>
        <div v-if="exp.vehicle" class="exp-spec">
          <dt><AdminIcon name="car" :size="14" /><span>Vehicle</span></dt>
          <dd dir="auto">{{ exp.vehicle }}</dd>
        </div>
        <div v-if="exp.seats" class="exp-spec">
          <dt><AdminIcon name="users" :size="14" /><span>Capacity</span></dt>
          <dd dir="auto">{{ exp.seats }}</dd>
        </div>
      </dl>

      <!-- Locale sync status: direct jump-to-editor per locale.
        Safe navigation throughout: a malformed item degrades to
        "missing" pills instead of crashing the whole grid. -->
      <div class="exp-locales" role="group" :aria-label="`Edit locales for ${exp.slug}`">
        <button
          v-for="loc in (['en', 'fr', 'ar'] as const)"
          :key="`${exp.slug}-${loc}`"
          type="button"
          class="exp-locale-pill"
          :class="{
            'exp-locale-pill--missing': !exp.locales?.[loc]?.exists,
            [`exp-locale-pill--${loc}`]: exp.locales?.[loc]?.exists,
          }"
          :disabled="!exp.locales?.[loc]?.exists"
          :title="exp.locales?.[loc]?.exists ? `Edit ${loc.toUpperCase()} version` : `${loc.toUpperCase()} file missing`"
          :aria-label="exp.locales?.[loc]?.exists ? `Edit ${exp.slug} in ${loc}` : `${loc} version missing for ${exp.slug}`"
          @click="emit('edit', exp.slug, loc)"
        >
          <span aria-hidden="true">{{ localeFlag(loc) }}</span>
          <span>{{ loc.toUpperCase() }}</span>
        </button>
      </div>

      <!-- Floating quick action bar -->
      <div class="exp-actions">
        <button
          type="button"
          class="exp-action exp-action--primary"
          :aria-label="`Edit ${exp.slug} experience`"
          @click="emit('edit', exp.slug, primaryLocale)"
        >
          <AdminIcon name="pencil" :size="16" />
          <span>Edit Experience</span>
        </button>
        <button
          type="button"
          class="exp-action"
          :aria-label="`View ${exp.slug} live`"
          @click="emit('view', exp)"
        >
          <AdminIcon name="external" :size="16" />
          <span>View Live</span>
        </button>
        <button
          type="button"
          class="exp-action"
          :aria-label="`Copy live link for ${exp.slug}`"
          @click="emit('copy', exp)"
        >
          <AdminIcon name="copy" :size="16" />
          <span>Copy Link</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { StudioLocale } from '~/composables/admin/useStudio'
import {
  localeFlag,
  primaryExpLocale,
  type ExperienceCatalogItem,
} from '~/composables/admin/experienceCatalog'

const props = withDefaults(
  defineProps<{
    exp: ExperienceCatalogItem
    swapping?: boolean
  }>(),
  { swapping: false }
)

const emit = defineEmits<{
  (e: 'edit', slug: string, locale: StudioLocale): void
  (e: 'view', exp: ExperienceCatalogItem): void
  (e: 'swap', exp: ExperienceCatalogItem, locale: StudioLocale): void
  (e: 'copy', exp: ExperienceCatalogItem): void
}>()

const primaryLocale = computed(() => primaryExpLocale(props.exp))
</script>

<style scoped>
.experience-admin-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    rgba(10, 14, 26, 0.55);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.experience-admin-card:hover {
  transform: translateY(-3px);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.45);
}

.exp-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.35);
}

.exp-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.exp-thumb--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

/* Floating price pill with glowing border */
.exp-price-badge {
  position: absolute;
  top: 0.7rem;
  inset-inline-end: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border-radius: 60px;
  border: 1px solid rgba(var(--accent-rgb, 201, 168, 124), 0.7);
  background: rgba(10, 14, 26, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--accent);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
  box-shadow:
    0 0 0 1px rgba(var(--accent-rgb, 201, 168, 124), 0.15),
    0 0 18px rgba(var(--accent-rgb, 201, 168, 124), 0.35);
}

.exp-price-eur {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Frosted hover overlay with quick image swap */
.exp-cover-overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  justify-content: center;
  padding: 0.6rem;
  background: linear-gradient(to top, rgba(5, 8, 16, 0.72), transparent);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.experience-admin-card:hover .exp-cover-overlay,
.exp-cover-overlay:focus-within {
  opacity: 1;
  transform: none;
}

@media (hover: none) {
  .exp-cover-overlay {
    opacity: 1;
    transform: none;
  }
}

.exp-overlay-btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border-radius: 60px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.15s ease;
}

.exp-overlay-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.exp-overlay-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.exp-overlay-btn:disabled {
  cursor: wait;
  opacity: 0.8;
}

.is-spinning {
  animation: exp-spin 1s linear infinite;
}

@keyframes exp-spin {
  to {
    transform: rotate(360deg);
  }
}

.exp-body {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem 1.1rem 1.1rem;
  flex: 1;
}

.exp-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.exp-slug {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.72rem;
  color: var(--accent);
}

/* Specs row: micro-chip grid */
.exp-specs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  align-items: start;
  margin: 0;
}

.exp-spec {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0.6rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  min-width: 0;
}

.exp-spec dt {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--accent);
  white-space: nowrap;
  overflow: hidden;
}

/* Crucial: icons never shrink — text truncates, the glyph stays crisp. */
.exp-spec .admin-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  min-width: 14px;
}

.exp-spec dt span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exp-spec dd {
  margin: 0;
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exp-locales {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.exp-locale-pill {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.8rem;
  border-radius: 60px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.15s ease, border-color 0.18s ease;
}

.exp-locale-pill:active {
  transform: scale(0.95);
}

.exp-locale-pill:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.exp-locale-pill--en {
  background: rgba(192, 132, 252, 0.16);
  border: 1px solid rgba(192, 132, 252, 0.5);
  color: #ede9fe;
}

.exp-locale-pill--fr {
  background: rgba(96, 165, 250, 0.16);
  border: 1px solid rgba(96, 165, 250, 0.5);
  color: #dbeafe;
}

.exp-locale-pill--ar {
  background: rgba(52, 211, 153, 0.16);
  border: 1px solid rgba(52, 211, 153, 0.5);
  color: #d1fae5;
}

.exp-locale-pill--missing {
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  color: var(--text-secondary);
  opacity: 0.55;
  cursor: not-allowed;
}

/* Floating quick action bar */
.exp-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.4rem;
  flex-wrap: wrap;
}

.exp-action {
  min-width: 44px;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.55rem 0.9rem;
  flex: 1 1 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
}

.exp-action:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.5);
}

.exp-action:hover:not(:disabled) .admin-icon {
  transform: scale(1.15);
}

.exp-action:active:not(:disabled) {
  transform: scale(0.96);
}

.exp-action:disabled {
  opacity: 0.5;
  cursor: wait;
}

.exp-action:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.exp-action--primary {
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.18);
  border-color: rgba(var(--accent-rgb, 201, 168, 124), 0.55);
  color: var(--accent);
  font-weight: 700;
}

.exp-action--primary:hover:not(:disabled) {
  background: rgba(var(--accent-rgb, 201, 168, 124), 0.28);
}

.exp-overlay-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .experience-admin-card,
  .exp-cover-overlay,
  .exp-overlay-btn,
  .exp-action,
  .exp-locale-pill,
  .is-spinning {
    animation: none;
    transition: none;
  }
}
</style>
