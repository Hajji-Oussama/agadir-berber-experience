<template>
  <div class="info-alert">
    <div class="info-alert-icon"><i class="fas fa-info-circle"></i></div>
    <div class="info-alert-content">
      <div class="info-alert-title" v-if="title">{{ title }}</div>
      <p class="info-alert-text" v-if="text">{{ text }}</p>
      <a v-if="link" :href="link" class="info-alert-link">
        Learn more
        <i class="fas fa-arrow-right info-alert-arrow"></i>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  text?: string
  link?: string
}>()
</script>

<style scoped>
.info-alert {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 16px;
  background: rgba(127, 181, 208, 0.1);
  border: 1px solid rgba(127, 181, 208, 0.35);
  border-left: 4px solid #7fb5d0;
}

.info-alert-icon {
  color: #7fb5d0;
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.info-alert-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
}

.info-alert-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 300;
  line-height: 1.6;
  margin: 0 0 0.5rem;
}

.info-alert-link {
  color: #7fb5d0;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    text-decoration: underline;

    .info-alert-arrow {
      transform: translateX(3px);
    }
  }
}

.info-alert-arrow {
  transition: transform 0.3s ease;
}

[dir="rtl"] .info-alert-arrow {
  transform: scaleX(-1);
}
</style>
