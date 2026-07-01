<template>
  <section class="gallery-section section-padding section-anchor" id="gallery">
    <div class="gallery-bg" aria-hidden="true">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <span class="eyebrow">{{ $t('gallery.eyebrow') }}</span>
        <h2 class="section-title">{{ $t('gallery.title') }}</h2>
        <p class="section-subtitle">{{ $t('gallery.subtitle') }}</p>
      </div>

      <div class="filters" v-if="availableCategories.length > 1" data-aos="fade-up">
        <button
          v-for="cat in availableCategories"
          :key="cat.id"
          :class="['filter-btn', { active: activeFilter === cat.id }]"
          @click="activeFilter = cat.id"
          :aria-label="cat.label"
        >
          <i v-if="cat.icon" :class="cat.icon"></i>
          {{ cat.label }}
        </button>
      </div>

      <div class="gallery-grid" v-if="filteredImages.length">
        <div
          v-for="(img, index) in filteredImages"
          :key="img.id"
          class="gallery-item"
          :class="`gallery-item--${img.size}`"
          data-aos="zoom-in"
          :data-aos-delay="(index % 12) * 80"
          @click="openLightbox(index)"
          role="button"
          :aria-label="img.label"
          tabindex="0"
          @keydown.enter="openLightbox(index)"
        >
          <div class="gallery-card">
            <div class="shimmer" :class="{ 'shimmer--loaded': loadedImages.has(img.id) }"></div>
            <img
              :src="img.url"
              :alt="img.label"
              loading="lazy"
              decoding="async"
              class="gallery-img"
              @load="onImageLoad(img.id)"
              @error="onImageLoad(img.id)"
            />
            <div class="gallery-overlay">
              <div class="overlay-content">
                <i class="fas fa-search-plus"></i>
                <span>{{ img.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state" data-aos="fade-up">
        <p>{{ $t('gallery.empty') }}</p>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightbox.isOpen"
          class="lightbox"
          @click.self="closeLightbox"
          ref="lightboxEl"
          tabindex="-1"
          role="dialog"
          :aria-label="$t('gallery.lightbox.close')"
        >
          <div class="lightbox-bg"></div>

          <button
            class="lightbox-close"
            @click="closeLightbox"
            :aria-label="$t('gallery.lightbox.close')"
          >
            <i class="fas fa-times"></i>
          </button>

          <button
            class="lightbox-nav lightbox-nav--prev"
            @click="prevImage"
            :disabled="lightbox.currentIndex === 0"
            :aria-label="$t('gallery.lightbox.previous')"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <div
            class="lightbox-image-wrapper"
            :key="lightbox.currentIndex"
            ref="imageWrapperRef"
            @touchstart="onPinchStart"
            @touchmove="onPinchMove"
            @touchend="onPinchEnd"
          >
            <div class="lightbox-image-container" :style="pinchStyle">
              <img
                :src="filteredImages[lightbox.currentIndex].urlLg"
                :alt="filteredImages[lightbox.currentIndex].label"
                class="lightbox-image"
                draggable="false"
                decoding="async"
              />
            </div>
          </div>

          <button
            class="lightbox-nav lightbox-nav--next"
            @click="nextImage"
            :disabled="lightbox.currentIndex === filteredImages.length - 1"
            :aria-label="$t('gallery.lightbox.next')"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <div class="lightbox-bottom">
            <span class="lightbox-label">
              {{ filteredImages[lightbox.currentIndex].label }}
            </span>
            <span class="lightbox-counter">
              {{ lightbox.currentIndex + 1 }} / {{ filteredImages.length }}
            </span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchGallery } from '@/services/api'
import { pushGuard, popGuard } from '@/composables/useBackGuard'

const { locale } = useI18n()
const data = ref(null)

watch(locale, async (newLocale) => {
  data.value = await fetchGallery(newLocale)
}, { immediate: true })

const activeFilter = ref('all')
const lightboxEl = ref(null)
const imageWrapperRef = ref(null)
const loadedImages = reactive(new Set())

const pinch = ref({
  scale: 1,
  baseScale: 1,
  lastDist: 0
})

const pinchStyle = computed(() => ({
  transform: `scale(${pinch.value.scale})`,
  transition: pinch.value.lastDist === 0 ? 'transform 0.2s ease' : 'none'
}))

let pinchStartDist = 0
let pinchBaseScale = 1

const categories = computed(() => data.value?.categories || [])

const categoryImageCount = computed(() => {
  const counts = {}
  const images = data.value?.images || []
  images.forEach(img => {
    counts[img.category] = (counts[img.category] || 0) + 1
  })
  return counts
})

const availableCategories = computed(() => {
  return categories.value.filter(cat => {
    if (cat.id === 'all') return true
    return (categoryImageCount.value[cat.id] || 0) > 0
  })
})

const filteredImages = computed(() => {
  const images = data.value?.images || []
  if (activeFilter.value === 'all') return images
  return images.filter(img => img.category === activeFilter.value)
})

const lightbox = ref({
  isOpen: false,
  currentIndex: 0
})

function onImageLoad(id) {
  loadedImages.add(id)
}

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function onPinchStart(e) {
  if (e.touches.length === 2) {
    pinchStartDist = getDistance(e.touches)
    pinchBaseScale = pinch.value.scale
  }
}

function onPinchMove(e) {
  if (e.touches.length === 2) {
    e.preventDefault()
    const dist = getDistance(e.touches)
    const ratio = dist / pinchStartDist
    let newScale = pinchBaseScale * ratio
    newScale = Math.max(0.5, Math.min(6, newScale))
    pinch.value.scale = newScale
    pinch.value.lastDist = dist
  }
}

function onPinchEnd() {
  pinchStartDist = 0
  pinchBaseScale = 1
  if (pinch.value.scale < 1) {
    pinch.value.scale = 1
  } else if (pinch.value.scale > 5) {
    pinch.value.scale = 5
  }
  pinch.value.lastDist = 0
}

function openLightbox(index) {
  if (!filteredImages.value.length) return
  pinch.value.scale = 1
  lightbox.value.isOpen = true
  lightbox.value.currentIndex = index
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', onKeydown)
  pushGuard(closeLightbox)
  nextTick(() => {
    lightboxEl.value?.focus()
  })
}

function closeLightbox() {
  popGuard(closeLightbox)
  pinch.value.scale = 1
  lightbox.value.isOpen = false
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
}

function nextImage() {
  if (lightbox.value.currentIndex < filteredImages.value.length - 1) {
    lightbox.value.currentIndex++
  }
}

function prevImage() {
  if (lightbox.value.currentIndex > 0) {
    lightbox.value.currentIndex--
  }
}

function onKeydown(e) {
  if (!lightbox.value.isOpen) return
  if (e.key === 'Escape') {
    closeLightbox()
  } else if (e.key === 'ArrowRight') {
    nextImage()
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  }
}

watch(activeFilter, () => {
  if (lightbox.value.isOpen) {
    closeLightbox()
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped lang="scss">
.gallery-section {
  position: relative;
  z-index: 1;
  overflow: hidden;
  background: var(--bg-gradient);

  .gallery-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;

    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.12;

      &.blob-1 {
        width: 400px;
        height: 400px;
        background: #c9a87c;
        top: -5%;
        right: -5%;
        animation: floatBlob 22s ease-in-out infinite;
      }

      &.blob-2 {
        width: 350px;
        height: 350px;
        background: #7fb5d0;
        bottom: 5%;
        left: -5%;
        animation: floatBlob 28s ease-in-out infinite reverse;
      }

      &.blob-3 {
        width: 250px;
        height: 250px;
        background: #d4a373;
        top: 40%;
        left: 40%;
        animation: floatBlob 30s ease-in-out infinite 8s;
      }
    }
  }

  @keyframes floatBlob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -25px) scale(1.08); }
    66% { transform: translate(-20px, 15px) scale(0.92); }
  }

  .section-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 2.5rem;
    position: relative;
    z-index: 1;

    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.75rem;
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 300;
      color: var(--text-primary);
      margin-bottom: 0.75rem;
    }

    .section-subtitle {
      color: var(--text-secondary);
      font-size: clamp(0.95rem, 1.5vw, 1.1rem);
      font-weight: 300;
      line-height: 1.6;
    }
  }

  .filters {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2.5rem;
    position: relative;
    z-index: 1;

    .filter-btn {
      padding: 0.5rem 1.2rem;
      border-radius: 60px;
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-secondary);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-family: inherit;
      letter-spacing: 0.02em;

      i {
        font-size: 0.75rem;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
        color: var(--text-primary);
      }

      &.active {
        background: var(--accent);
        color: #000;
        border-color: var(--accent);
        box-shadow: 0 4px 20px rgba(201, 168, 124, 0.3);
      }
    }
  }

  .gallery-grid {
    display: grid;
    gap: 0.8rem;
    position: relative;
    z-index: 1;

    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 150px;

    @media (min-width: 481px) {
      gap: 1rem;
      grid-auto-rows: 180px;
    }

    @media (min-width: 641px) {
      grid-template-columns: repeat(3, 1fr);
      grid-auto-rows: 200px;
    }

    @media (min-width: 1025px) {
      grid-template-columns: repeat(4, 1fr);
      grid-auto-rows: 220px;
    }

    @media (min-width: 1441px) {
      grid-template-columns: repeat(5, 1fr);
      grid-auto-rows: 250px;
      gap: 1.2rem;
    }

    .gallery-item {
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      outline: none;

      &:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 3px;
      }

      &--wide {
        grid-column: span 2;
      }

      &--tall {
        grid-row: span 2;
      }

      &--large {
        grid-column: span 2;
        grid-row: span 2;
      }

      @media (max-width: 480px) {
        &--wide { grid-column: span 2; }
        &--tall { grid-row: span 2; }
        &--large { grid-column: span 2; grid-row: span 2; }
      }

      .gallery-card {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.06);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
          position: relative;
          z-index: 1;
        }

        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 14, 26, 0.65);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          transform: translateY(8px);
          z-index: 2;

          .overlay-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-primary);
            transform: translateY(10px);
            transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);

            i { font-size: 1.3rem; opacity: 0.8; }
            span {
              font-family: var(--font-heading);
              font-size: 0.9rem;
              font-weight: 300;
              text-align: center;
              padding: 0 0.5rem;
            }
          }
        }

        @media (hover: hover) {
          &:hover {
            .gallery-img { transform: scale(1.1); }
            .gallery-overlay { opacity: 1; transform: translateY(0); }
            .overlay-content { transform: translateY(0); }
          }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-secondary);
    font-weight: 300;
    position: relative;
    z-index: 1;
  }
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;

  .lightbox-bg {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.92);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }

  .lightbox-close {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 10;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: var(--accent);
      transform: scale(1.1);
    }

    @media (max-width: 768px) {
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }
  }

  .lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
      border-color: var(--accent);
      transform: translateY(-50%) scale(1.1);
    }

    &:disabled { opacity: 0.2; cursor: default; }

    &--prev { left: 1.5rem; }
    &--next { right: 1.5rem; }

    @media (max-width: 768px) {
      width: 42px; height: 42px; font-size: 1rem;
      &--prev { left: 0.75rem; }
      &--next { right: 0.75rem; }
    }

    @media (max-width: 480px) {
      width: 36px; height: 36px; font-size: 0.85rem;
      &--prev { left: 0.5rem; }
      &--next { right: 0.5rem; }
    }
  }

  .lightbox-image-wrapper {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 90vw;
    max-height: 85vh;
    overflow: hidden;
    animation: lightboxEnter 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    touch-action: pan-y pinch-zoom;

    @keyframes lightboxEnter {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }

    .lightbox-image-container {
      display: flex;
      align-items: center;
      justify-content: center;
      will-change: transform;
      transform-origin: center center;

      .lightbox-image {
        max-width: 90vw;
        max-height: 85vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
        user-select: none;
        -webkit-user-drag: none;
        pointer-events: none;
      }
    }
  }

  .lightbox-bottom {
    position: absolute;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.6rem 1.5rem;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 60px;
    border: 1px solid rgba(255, 255, 255, 0.08);

    .lightbox-label {
      font-family: var(--font-heading);
      font-size: 0.85rem;
      font-weight: 300;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .lightbox-counter {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 300;
    }

    @media (max-width: 768px) {
      bottom: 1rem; padding: 0.5rem 1rem; gap: 1rem;
      .lightbox-label { font-size: 0.75rem; }
      .lightbox-counter { font-size: 0.7rem; }
    }

    @media (max-width: 480px) {
      flex-direction: column; gap: 0.3rem; bottom: 0.75rem; padding: 0.4rem 0.8rem;
    }
  }
}

.lightbox-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  .lightbox-bg { transition: opacity 0.4s ease; }
}

.lightbox-enter-from {
  opacity: 0;
  .lightbox-bg { opacity: 0; }
  .lightbox-image-wrapper { animation: none; opacity: 0; transform: scale(0.9); }
}

.lightbox-leave-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.lightbox-leave-to {
  opacity: 0;
  .lightbox-image-wrapper { opacity: 0; transform: scale(0.92); }
}

[dir="rtl"] {
  .lightbox-nav {
    &--prev { left: auto; right: 1.5rem;
      @media (max-width: 768px) { right: 0.75rem; }
      @media (max-width: 480px) { right: 0.5rem; }
    }
    &--next { right: auto; left: 1.5rem;
      @media (max-width: 768px) { left: 0.75rem; }
      @media (max-width: 480px) { left: 0.5rem; }
    }
  }
  .lightbox-close { right: auto; left: 1.5rem;
    @media (max-width: 768px) { left: 1rem; }
  }
  .lightbox-bottom { flex-direction: row-reverse; }
}
</style>
