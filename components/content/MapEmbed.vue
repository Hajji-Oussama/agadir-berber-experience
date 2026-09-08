<template>
  <div class="map-embed">
    <div v-if="title" class="map-embed-title">{{ title }}</div>
    <div class="map-embed-frame">
      <iframe
        :src="embedSrc"
        :title="title || 'Agadir Berbère Expérience — Kasbat Souss, Agadir'"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import siteConfig from '~/data/siteConfig.json'

const props = withDefaults(
  defineProps<{
    title?: string
    src?: string
  }>(),
  {
    title: '',
    src: '',
  }
)

// Official Google Maps Kasbat Souss embed. Override `src` only when a
// different location is intentionally required.
const embedSrc = computed(
  () =>
    props.src ||
    (siteConfig as { map?: { embedUrl?: string } }).map?.embedUrl ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d440537.8362951347!2d-8.991956573437495!3d30.387823200000007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdb3b707cb0f0991%3A0x64f5767cbe32d430!2sAGADIR%20berb%C3%A8re%20exp%C3%A9rience!5e0!3m2!1sar!2sma!4v1787156653124!5m2!1sar!2sma'
)
</script>

<style scoped lang="scss">
.map-embed {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  background-image: linear-gradient(135deg, rgba(201, 168, 124, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 168, 124, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  @media (max-width: 640px) {
    padding: 1rem;
  }
}

.map-embed-title {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 1rem;
  text-align: center;
}

.map-embed-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 280px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
}

[dir="rtl"] .map-embed-title {
  text-align: center;
}
</style>
