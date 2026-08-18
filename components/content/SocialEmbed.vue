<template>
  <div v-if="src" class="social-embed" :class="`social-embed--${platform}`">
    <iframe
      :src="src"
      class="social-embed-frame"
      frameborder="0"
      allowfullscreen
      loading="lazy"
      :title="`${platform} embed`"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  platform?: string
  id?: string
}>()

const src = computed(() => {
  switch (props.platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${props.id}`
    case 'tiktok':
      return `https://www.tiktok.com/embed/${props.id}`
    case 'instagram':
      return `https://www.instagram.com/p/${props.id}/embed`
    default:
      return ''
  }
})
</script>

<style scoped>
.social-embed {
  width: 100%;
  margin: 2rem 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
}

.social-embed--youtube {
  aspect-ratio: 16 / 9;
}

.social-embed--tiktok {
  aspect-ratio: 9 / 16;
  max-width: 380px;
  margin-left: auto;
  margin-right: auto;
}

.social-embed--instagram {
  aspect-ratio: 4 / 5;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.social-embed-frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
