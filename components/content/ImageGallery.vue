<template>
  <div v-if="images?.length" class="image-gallery">
    <img
      v-for="(src, i) in images"
      :key="i"
      :src="src"
      :alt="`Gallery image ${i + 1}`"
      class="image-gallery-item"
      loading="lazy"
      decoding="async"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  images?: string[]
}>()
</script>

<style scoped>
.image-gallery {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
  margin: 2rem 0;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.image-gallery::-webkit-scrollbar {
  height: 6px;
}

.image-gallery::-webkit-scrollbar-track {
  background: transparent;
}

.image-gallery::-webkit-scrollbar-thumb {
  background: var(--accent);
  border-radius: 3px;
}

.image-gallery-item {
  height: 250px;
  flex: 0 0 auto;
  scroll-snap-align: center;
  border-radius: 16px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
</style>
