<script setup lang="ts">
import { useLocaleHead } from '#i18n'

const { locale } = useI18n()
const head = useLocaleHead()

useSeoMeta({
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
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
