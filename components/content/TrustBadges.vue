<template>
  <div class="trust-badges">
    <div v-for="b in badges" :key="b.label" class="trust-badge">
      <i :class="b.icon" class="trust-badge-icon"></i>
      <span class="trust-badge-label">{{ b.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const badges = [
  { icon: 'fas fa-ban', label: 'Free Cancellation' },
  { icon: 'fas fa-map-marked-alt', label: 'Local Guides' },
  { icon: 'fas fa-shield-alt', label: '100% Safe' },
]
</script>

<style scoped>
.trust-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin: 2rem 0;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.trust-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
}

.trust-badge-icon {
  color: var(--accent);
  font-size: 1.15rem;
}
</style>
