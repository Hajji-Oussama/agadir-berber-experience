// src/components/sections/HeroSection.vue
<template>
  <section class="hero-section" ref="heroRef" @mousemove="onMouseMove">
    <div class="hero-bg" ref="bgRef"></div>
    <div class="hero-overlay"></div>
    <div class="container hero-content" data-aos="fade-up">
      <h1 class="hero-title">{{ $t('hero.title') }}</h1>
      <p class="hero-subtitle">{{ $t('hero.subtitle') }}</p>
      <router-link to="/trips" class="btn-primary">{{ $t('hero.cta') }}</router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const heroRef = ref(null)
const bgRef = ref(null)
const isTouchDevice = ref(false)

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

function onMouseMove(e) {
  if (isTouchDevice.value || !bgRef.value || !heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  bgRef.value.style.transform = `translate(${x * 15}px, ${y * 10}px) scale(1.05)`
}
</script>

<style scoped lang="scss">
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 8rem 0;
  margin-top: -2rem;
  z-index: 1;

  .hero-bg {
    position: absolute;
    inset: 0;
    background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80');
    background-size: cover;
    background-position: center;
    filter: brightness(0.5) saturate(1.2);
    transform: scale(1.05);
    transition: transform 0.1s ease-out;
    will-change: transform;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.7) 100%);
  }

  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 900px;
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.8rem, 10vw, 6rem);
    font-weight: 300;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    text-shadow: 0 5px 30px rgba(0, 0, 0, 0.5);
  }

  .hero-subtitle {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    color: var(--text-secondary);
    margin-bottom: 2.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    font-weight: 300;
  }

  .btn-primary {
    display: inline-block;
    padding: 1rem 3rem;
    background: var(--accent);
    color: #000;
    border-radius: 60px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 10px 30px rgba(201, 168, 124, 0.3);

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(201, 168, 124, 0.5);
      background: #d4b88a;
    }
  }
}
</style>
