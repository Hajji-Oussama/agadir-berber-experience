<script setup lang="ts">
import siteConfig from '~/data/siteConfig.json'

const { locale } = useI18n()

// Localized homepage SEO (SSR-safe, reactive).
// Note: <link rel="canonical"> is already emitted globally via useLocaleHead()
// in app.vue, so only ogUrl is set here to avoid duplicate canonical tags.
const homeSeo = computed(() => {
  if (locale.value === 'fr') {
    return {
      title: 'Aventures Authentiques en Quad, Buggy & Circuits Berbères',
      description:
        'Réservez les meilleures expériences quad, buggy et balades à cheval à Agadir, Maroc.',
    }
  }
  if (locale.value === 'ar') {
    return {
      title: 'مغامرات الكواد والباغي والجولات الأمازيغية الأصيلة',
      description: 'احجز أفضل تجارب الكواد والباغي وركوب الخيل في أكادير، المغرب.',
    }
  }
  return {
    title: 'Authentic Desert Quad Biking, Buggy & Amazigh Tours',
    description: 'Book the best quad biking, buggy, and horse riding experiences in Agadir.',
  }
})

const homeCanonicalUrl = computed(() => {
  const base: string = siteConfig.website ?? 'https://www.agadirberbereexperience.com'
  return `${base}/${locale.value}`
})

useSeoMeta({
  title: () => homeSeo.value.title,
  description: () => homeSeo.value.description,
  ogTitle: () => homeSeo.value.title,
  ogDescription: () => homeSeo.value.description,
  ogType: 'website',
  ogUrl: () => homeCanonicalUrl.value,
  ogImage: 'https://res.cloudinary.com/nczftcee/image/upload/f_auto,q_auto/v1783095267/WhatsApp_Image_2026-06-29_at_3.27.53_PM_2_yuqsy5.jpg',
})
</script>

<template>
  <div>
    <SectionsHeroSlider />
    <SectionsServicesSection />
    <SectionsStatsSection />
    <SectionsTimelineSection />
    <SectionsTestimonialsSection />
    <SectionsGallerySection />
    <SectionsContactSection />
  </div>
</template>
