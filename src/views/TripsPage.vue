<!-- FILE: src/views/TripsPage.vue -->
<template>
  <div class="page-container">
    <h1 class="page-title">{{ $t('trips.title') }}</h1>
    <TripsSection />
  </div>
</template>

<script setup>
import TripsSection from '@/components/sections/TripsSection.vue'
</script>

<style scoped lang="scss">
.page-container { padding-top: 8rem; }
.page-title { text-align: center; font-family: var(--font-heading); font-size: 3rem; font-weight: 300; }
</style>