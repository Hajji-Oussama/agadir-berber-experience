<!-- FILE: src/views/ServicesPage.vue -->
<template>
  <div class="page-container">
    <h1 class="page-title">{{ $t('services.title') }}</h1>
    <ServicesSection />
  </div>
</template>

<script setup>
import ServicesSection from '@/components/sections/ServicesSection.vue'
</script>

<style scoped lang="scss">
.page-container { padding-top: 8rem; }
.page-title { text-align: center; font-family: var(--font-heading); font-size: 3rem; font-weight: 300; }
</style>