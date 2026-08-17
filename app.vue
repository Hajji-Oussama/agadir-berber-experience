<script setup lang="ts">
import { useLocaleHead } from '#i18n'

const head = useLocaleHead()

useHead({
  htmlAttrs: computed(() => ({
    lang: head.value.htmlAttrs?.lang,
    dir: head.value.htmlAttrs?.dir,
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
