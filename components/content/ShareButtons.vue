<template>
  <div class="share-buttons">
    <span class="share-buttons-label">Share this experience:</span>
    <a
      :href="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="share-btn share-btn--whatsapp"
      aria-label="Share on WhatsApp"
    >
      <i class="fab fa-whatsapp"></i>
    </a>
    <a
      :href="facebookUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="share-btn share-btn--facebook"
      aria-label="Share on Facebook"
    >
      <i class="fab fa-facebook-f"></i>
    </a>
    <a
      :href="twitterUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="share-btn share-btn--twitter"
      aria-label="Share on X"
    >
      <i class="fab fa-twitter"></i>
    </a>
  </div>
</template>

<script setup lang="ts">
import siteConfig from '~/data/siteConfig.json'

const route = useRoute()

const shareUrl = computed(() => `${siteConfig.website}${route.fullPath}`)
const shareText = 'Check out this amazing experience in Agadir!'

const whatsappUrl = computed(() => `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl.value}`)}`)
const facebookUrl = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`)
const twitterUrl = computed(() => `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareText)}`)
</script>

<style scoped>
.share-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.share-buttons-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 300;
  margin-right: 0.5rem;
}

.share-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
}

.share-btn--whatsapp { background: #25D366; }
.share-btn--facebook { background: #1877F2; }
.share-btn--twitter { background: #1DA1F2; }

.share-btn:hover {
  transform: translateY(-3px) scale(1.05);
  filter: brightness(1.1);
}
</style>
