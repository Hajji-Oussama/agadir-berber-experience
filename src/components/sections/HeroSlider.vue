<template>
  <section class="hero-slider" id="hero" ref="sliderRef">
    <div class="slides-track" ref="trackRef" @touchstart.prevent="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <article
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="slide"
        :class="{ active: currentIndex === index }"
        :aria-hidden="currentIndex !== index"
      >
        <div class="slide-media" ref="mediaRefs" :style="mediaStyle(slide)">
          <video
            v-if="slide.video"
            :src="slide.video"
            class="slide-video"
            autoplay
            muted
            loop
            playsinline
          ></video>
        </div>

        <div class="slide-overlay"></div>

        <div class="slide-content container">
          <span class="slide-eyebrow">{{ slide.eyebrow }}</span>
          <h1 class="slide-title">{{ slide.title }}</h1>
          <p class="slide-subtitle">{{ slide.subtitle }}</p>
          <div class="slide-actions">
            <router-link :to="slide.ctaExplore" class="btn btn--primary">Explore</router-link>
            <a :href="slide.ctaBook" target="_blank" rel="noopener" class="btn btn--ghost">Book Now</a>
          </div>
        </div>
      </article>
    </div>

    <button class="nav-arrow nav-arrow--prev" @click="prev" aria-label="Previous slide">
      <i class="fas fa-chevron-left"></i>
    </button>
    <button class="nav-arrow nav-arrow--next" @click="next" aria-label="Next slide">
      <i class="fas fa-chevron-right"></i>
    </button>

    <div class="slider-bottom">
      <div class="progress-bar" ref="progressRef">
        <div class="progress-fill" :style="{ width: progressWidth + '%' }"></div>
      </div>

      <div class="thumbnails-strip" ref="thumbStripRef">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id"
          class="thumb"
          :class="{ active: currentIndex === index }"
          @click="goTo(index)"
          :aria-label="`Go to slide ${index + 1}`"
        >
          <img :src="slide.image" :alt="slide.title" />
        </button>
      </div>

      <div class="dots">
        <span
          v-for="(slide, index) in slides"
          :key="slide.id"
          :class="['dot', { active: currentIndex === index }]"
          @click="goTo(index)"
        ></span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import slidesData from '@/data/slides.json'

const slides = slidesData

const currentIndex = ref(0)
const progressWidth = ref(0)
const isTouchDevice = ref(false)
const autoPlayInterval = 6000

const sliderRef = ref(null)
const trackRef = ref(null)
const thumbStripRef = ref(null)
const progressRef = ref(null)
const mediaRefs = ref([])

let progressTimer = null
let autoPlayTimer = null
let touchStartX = 0
let touchDeltaX = 0

const currentSlide = computed(() => slides[currentIndex.value])

function mediaStyle(slide) {
  if (slide.image && !slide.video) {
    return { backgroundImage: `url(${slide.image})` }
  }
  return {}
}

function applyAccentColor(slide) {
  document.documentElement.style.setProperty('--accent', slide.accentColor)
  document.documentElement.style.setProperty('--accent-rgb', hexToRgb(slide.accentColor))
  if (slide.blobColors) {
    document.documentElement.style.setProperty('--blob-gold', slide.blobColors[0] || slide.accentColor)
    document.documentElement.style.setProperty('--blob-teal', slide.blobColors[1] || '#2dd4bf')
    document.documentElement.style.setProperty('--blob-white', slide.blobColors[2] || 'rgba(255,255,255,0.3)')
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '201, 168, 124'
}

function goTo(index) {
  if (index < 0) index = slides.length - 1
  if (index >= slides.length) index = 0
  currentIndex.value = index
  applyAccentColor(slides[index])
  resetProgress()
  resetAutoPlay()
  scrollThumbHorizontally(index)
}

function next() {
  goTo(currentIndex.value + 1)
}

function prev() {
  goTo(currentIndex.value - 1)
}

function resetProgress() {
  progressWidth.value = 0
  clearInterval(progressTimer)
  progressTimer = setInterval(() => {
    if (progressWidth.value < 100) {
      progressWidth.value += 100 / (autoPlayInterval / 30)
    }
  }, 30)
}

function resetAutoPlay() {
  clearInterval(autoPlayTimer)
  autoPlayTimer = setInterval(() => {
    next()
  }, autoPlayInterval)
}

function scrollThumbHorizontally(index) {
  nextTick(() => {
    const strip = thumbStripRef.value
    if (!strip) return
    const thumbs = strip.querySelectorAll('.thumb')
    if (!thumbs[index]) return
    const stripRect = strip.getBoundingClientRect()
    const thumbRect = thumbs[index].getBoundingClientRect()
    const offset = thumbRect.left - stripRect.left - (stripRect.width / 2 - thumbRect.width / 2)
    strip.scrollLeft += offset
  })
}

function onTouchStart(e) {
  isTouchDevice.value = true
  touchStartX = e.touches[0].clientX
  touchDeltaX = 0
  clearInterval(autoPlayTimer)
  clearInterval(progressTimer)
}

function onTouchMove(e) {
  touchDeltaX = e.touches[0].clientX - touchStartX
}

function onTouchEnd() {
  if (Math.abs(touchDeltaX) > 50) {
    if (touchDeltaX < 0) next()
    else prev()
  }
  resetAutoPlay()
  resetProgress()
}

function onMouseMove(e) {
  if (isTouchDevice.value || !sliderRef.value) return
  const rect = sliderRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  const activeSlide = sliderRef.value.querySelector('.slide.active .slide-media')
  if (activeSlide) {
    activeSlide.style.transform = `translate(${x * 20}px, ${y * 15}px) scale(1.08)`
  }
}

function onMouseLeaveSlider() {
  if (isTouchDevice.value) return
  const activeSlide = sliderRef.value?.querySelector('.slide.active .slide-media')
  if (activeSlide) {
    activeSlide.style.transform = 'translate(0, 0) scale(1)'
  }
}

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  applyAccentColor(slides[0])
  resetProgress()
  resetAutoPlay()

  if (sliderRef.value && !isTouchDevice.value) {
    sliderRef.value.addEventListener('mousemove', onMouseMove)
    sliderRef.value.addEventListener('mouseleave', onMouseLeaveSlider)
  }
})

onBeforeUnmount(() => {
  clearInterval(progressTimer)
  clearInterval(autoPlayTimer)
  if (sliderRef.value) {
    sliderRef.value.removeEventListener('mousemove', onMouseMove)
    sliderRef.value.removeEventListener('mouseleave', onMouseLeaveSlider)
  }
})
</script>

<style scoped lang="scss">
.hero-slider {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
  margin-top: -2rem;

  @media (max-width: 768px) {
    height: 100dvh;
  }
}

.slides-track {
  width: 100%;
  height: 100%;
  position: relative;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.8s ease, transform 0.8s ease;
  transform: scale(1.05);
  z-index: 0;

  &.active {
    opacity: 1;
    transform: scale(1);
    z-index: 1;
  }
}

.slide-media {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.15s ease-out;
  will-change: transform;
}

.slide-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 2;
}

.slide-content {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 6rem;

  @media (max-width: 768px) {
    padding: 6rem 2rem 10rem;
  }
}

.slide-eyebrow {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: var(--accent);
  margin-bottom: 1rem;
  font-weight: 400;
  animation: fadeInUp 0.6s ease forwards;
}

.slide-title {
  font-family: var(--font-heading);
  font-size: clamp(2.8rem, 10vw, 6rem);
  font-weight: 300;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: 1.2rem;
  max-width: 800px;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
  animation: fadeInUp 0.6s ease 0.1s forwards;
}

.slide-subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--text-secondary);
  max-width: 550px;
  margin-bottom: 2.5rem;
  font-weight: 300;
  line-height: 1.6;
  animation: fadeInUp 0.6s ease 0.2s forwards;
}

.slide-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  animation: fadeInUp 0.6s ease 0.3s forwards;

  .btn {
    padding: 0.9rem 2.5rem;
    min-height: 48px;
    border-radius: 60px;
    font-weight: 500;
    letter-spacing: 0.05em;
    transition: all 0.3s ease;
    text-decoration: none;
    font-size: 0.95rem;
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn--primary {
    background: var(--accent);
    color: #000;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    }
  }

  .btn--ghost {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--accent);
    }
  }
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-50%) scale(1.1);
  }

  &--prev { left: 1.5rem; }
  &--next { right: 1.5rem; }

  @media (max-width: 768px) {
    display: none;
  }
}

.slider-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 1.5rem 2rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);

  @media (max-width: 768px) {
    padding: 1rem 1rem 1.5rem;
  }
}

.progress-bar {
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  margin-bottom: 1.2rem;
  overflow: hidden;

  .progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: width 0.1s linear;
  }
}

.thumbnails-strip {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    justify-content: flex-start;
    padding: 0 1rem 0.5rem;
    scroll-snap-type: x mandatory;

    .thumb {
      scroll-snap-align: center;
      flex-shrink: 0;
    }
  }
}

.thumb {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  background: transparent;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.active {
    border-color: var(--accent);
    box-shadow: 0 0 20px rgba(var(--accent-rgb, 201, 168, 124), 0.4);
    transform: scale(1.1);
  }

  &:hover:not(.active) {
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
}

.dots {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 0.8rem;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      background: var(--accent);
      width: 24px;
      border-radius: 4px;
    }
  }

  @media (min-width: 769px) {
    display: none;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
