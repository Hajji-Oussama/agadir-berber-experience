<template>
  <div class="booking-card">
    <div class="booking-card-title" v-if="title">{{ title }}</div>
    <div class="booking-card-price" v-if="price">{{ price }}</div>
    <NuxtLink v-if="link" :to="link" class="booking-card-btn">
      <i class="fab fa-whatsapp"></i>
      Book Now
    </NuxtLink>
    <span v-else class="booking-card-btn booking-card-btn--disabled">Book Now</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  price?: string
  link?: string
}>()
</script>

<style scoped>
.booking-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  background-image: linear-gradient(135deg, rgba(201, 168, 124, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 168, 124, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.booking-card-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--text-primary);
}

.booking-card-price {
  font-family: var(--font-heading);
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--accent);
  line-height: 1;
}

.booking-card-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.85rem 2rem;
  min-height: 48px;
  border-radius: 60px;
  background: #25D366;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.3);

  i {
    font-size: 1.15rem;
  }

  &:hover {
    background: #20bd5a;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 30px rgba(37, 211, 102, 0.45);
  }

  &--disabled {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);
    box-shadow: none;
    cursor: default;
  }
}
</style>
