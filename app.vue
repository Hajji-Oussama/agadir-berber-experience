<script setup lang="ts">
import { useLocaleHead } from '#i18n'
import { generateOrganizationSchema } from '~/composables/useJsonLd'

const { locale } = useI18n()
const head = useLocaleHead()

useSeoMeta({
  title: 'Agadir Berbère Expérience - Authentic Desert & Outdoor Adventures',
  titleTemplate: '%s - Agadir Berbère Expérience',
  description: 'Authentic desert quad biking, camel trekking, and Moroccan experiences in Agadir.',
})

useHead({
  htmlAttrs: computed(() => ({
    dir: locale.value === 'ar' ? 'rtl' : 'ltr',
    lang: locale.value,
  })),
  link: computed(() => head.value.link),
  meta: computed(() => head.value.meta),
})

// Global Organization schema (SSR-safe, injected once, non-conflicting with useLocaleHead)
const orgSchema = generateOrganizationSchema()

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(orgSchema),
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
