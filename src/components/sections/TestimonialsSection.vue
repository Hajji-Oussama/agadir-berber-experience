<template>
  <section class="testimonials-section section-padding section-anchor" id="testimonials">
    <div class="testimonials-bg" aria-hidden="true">
      <div class="blob blob-gold"></div>
      <div class="blob blob-blue"></div>
      <div class="blob blob-orange"></div>
    </div>

    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <span class="eyebrow">{{ $t('testimonials.eyebrow') }}</span>
        <h2 class="section-title">{{ $t('testimonials.title') }}</h2>
        <p class="section-subtitle">{{ $t('testimonials.subtitle') }}</p>
      </div>

      <div
        class="slider-wrapper"
        :class="{ 'slider-wrapper--active': isHovering }"
        @mouseenter="onHover(true)"
        @mouseleave="onHover(false)"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        ref="sliderWrapper"
        tabindex="0"
        role="region"
        :aria-label="$t('testimonials.title')"
        @keydown.left="prev"
        @keydown.right="next"
      >
        <button
          class="arrow arrow--left"
          @click="prev"
          :aria-label="$t('testimonials.prev')"
          v-show="reviews.length > 1"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <div class="cards-wrapper" :style="{ minHeight: `${wrapperHeight}px` }">
          <template v-if="reviews.length">
            <Transition :name="transitionName" mode="out-in">
              <div class="testimonial-card" :key="current">
                <div class="card-inner">
                  <div class="avatar-wrapper">
                    <div class="avatar-ring"></div>
                    <img
                      :src="reviews[current].avatar"
                      :alt="reviews[current].name"
                      class="avatar"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div class="stars">
                    <i
                      v-for="n in 5"
                      :key="n"
                      class="fas fa-star"
                      :class="{
                        'star--filled': n <= reviews[current].rating,
                        'star--empty': n > reviews[current].rating,
                        'star--pop': n <= reviews[current].rating
                      }"
                      :style="n <= reviews[current].rating ? { '--star-delay': `${(n - 1) * 0.12}s` } : {}"
                    ></i>
                  </div>

                  <p class="quote">&ldquo;{{ reviews[current].text }}&rdquo;</p>

                  <div class="author">
                    <strong>{{ reviews[current].name }}</strong>
                    <span>{{ reviews[current].location }}</span>
                  </div>
                </div>
              </div>
            </Transition>
          </template>
          <div v-else class="empty-state">
            <p>{{ $t('testimonials.empty') }}</p>
          </div>
        </div>

        <button
          class="arrow arrow--right"
          @click="next"
          :aria-label="$t('testimonials.next')"
          v-show="reviews.length > 1"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <div class="dots" v-if="reviews.length > 1">
        <button
          v-for="(review, index) in reviews"
          :key="review.id"
          :class="['dot', { 'dot--active': current === index }]"
          @click="goTo(index)"
          :aria-label="`${$t('testimonials.goto')} ${index + 1}`"
        ></button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchTestimonials } from '@/services/api'

const { locale } = useI18n()

const data = ref(null)

watch(locale, async (newLocale) => {
  data.value = await fetchTestimonials(newLocale)
}, { immediate: true })

const sliderWrapper = ref(null)
const current = ref(0)
const isPaused = ref(false)
const isHovering = ref(false)
const wrapperHeight = ref(400)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchDeltaX = ref(0)
const isHorizontalSwipe = ref(false)
let intervalId = null
let resumeTimeoutId = null

const isRTL = computed(() => locale.value === 'ar')

const transitionName = computed(() => (isRTL.value ? 'slide-fade-rtl' : 'slide-fade'))

const reviews = computed(() => data.value?.reviews || [])

function startAutoplay() {
  stopAutoplay()
  intervalId = setInterval(() => {
    if (!isPaused.value) {
      current.value = (current.value + 1) % reviews.value.length
    }
  }, 6000)
}

function stopAutoplay() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function resetAutoplay() {
  stopAutoplay()
  startAutoplay()
}

function onHover(active) {
  isHovering.value = active
  if (active) {
    isPaused.value = true
    if (resumeTimeoutId) {
      clearTimeout(resumeTimeoutId)
      resumeTimeoutId = null
    }
  } else {
    if (resumeTimeoutId) clearTimeout(resumeTimeoutId)
    resumeTimeoutId = setTimeout(() => {
      isPaused.value = false
      resumeTimeoutId = null
    }, 3000)
  }
}

function onTouchStart(e) {
  isPaused.value = true
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  touchDeltaX.value = 0
  isHorizontalSwipe.value = false
}

function onTouchMove(e) {
  const touch = e.touches[0]
  const dx = touch.clientX - touchStartX.value
  const dy = touch.clientY - touchStartY.value

  if (!isHorizontalSwipe.value) {
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      isHorizontalSwipe.value = true
    }
  }

  if (isHorizontalSwipe.value) {
    e.preventDefault()
  }

  touchDeltaX.value = dx
}

function onTouchEnd(e) {
  const diff = e.changedTouches[0].clientX - touchStartX.value
  const threshold = 50

  if (isHorizontalSwipe.value && Math.abs(diff) > threshold) {
    if (isRTL.value) {
      if (diff > threshold) next()
      else if (diff < -threshold) prev()
    } else {
      if (diff > threshold) prev()
      else if (diff < -threshold) next()
    }
  }

  if (resumeTimeoutId) clearTimeout(resumeTimeoutId)
  resumeTimeoutId = setTimeout(() => {
    isPaused.value = false
    resumeTimeoutId = null
  }, 3000)
}

function goTo(index) {
  if (index === current.value) return
  current.value = index
  resetAutoplay()
}

function next() {
  current.value = (current.value + 1) % reviews.value.length
  resetAutoplay()
}

function prev() {
  current.value = (current.value - 1 + reviews.value.length) % reviews.value.length
  resetAutoplay()
}

function measureHeight() {
  const card = sliderWrapper.value?.querySelector('.testimonial-card')
  if (card) {
    wrapperHeight.value = card.offsetHeight + 32
  }
}

onMounted(() => {
  startAutoplay()
  requestAnimationFrame(measureHeight)
})

watch(current, () => {
  requestAnimationFrame(measureHeight)
})

onBeforeUnmount(() => {
  stopAutoplay()
  if (resumeTimeoutId) clearTimeout(resumeTimeoutId)
})
</script>

<style scoped lang="scss">
.testimonials-section {
  position: relative;
  z-index: 1;
  overflow: hidden;
  background: var(--bg-gradient);

  .testimonials-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;

    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;

      &.blob-gold {
        width: 400px;
        height: 400px;
        background: #c9a87c;
        top: -10%;
        left: -5%;
        animation: floatBlob 20s ease-in-out infinite;
      }

      &.blob-blue {
        width: 300px;
        height: 300px;
        background: #7fb5d0;
        bottom: 10%;
        right: -5%;
        animation: floatBlob 25s ease-in-out infinite reverse;
      }

      &.blob-orange {
        width: 250px;
        height: 250px;
        background: #d4a373;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: floatBlob 30s ease-in-out infinite 5s;
      }
    }
  }

  @keyframes floatBlob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.1); }
    66% { transform: translate(-20px, 15px) scale(0.9); }
  }

  .section-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 3.5rem;
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

  .slider-wrapper {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1rem;
    outline: none;

    &:focus-visible {
      .cards-wrapper {
        outline: 2px solid var(--accent);
        outline-offset: 4px;
      }
    }

    .arrow {
      flex-shrink: 0;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      font-size: 1.1rem;
      will-change: transform;

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: var(--accent);
        color: var(--accent);
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }

      @media (max-width: 768px) {
        display: none;
      }
    }

    .cards-wrapper {
      flex: 1;
      position: relative;
      min-height: 360px;
      display: flex;
      align-items: center;

      @media (max-width: 768px) {
        min-height: 340px;
      }

      @media (max-width: 480px) {
        min-height: 300px;
      }
    }
  }

  .testimonial-card {
    width: 100%;

    .card-inner {
      padding: 2.5rem;
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      text-align: center;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);

      @media (hover: hover) {
        &:hover {
          transform: translateY(-5px);
          border-color: var(--accent);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
      }

      @media (max-width: 768px) {
        padding: 2rem;
      }

      @media (max-width: 480px) {
        padding: 1.5rem;
      }

      .avatar-wrapper {
        position: relative;
        width: 80px;
        height: 80px;
        margin: 0 auto 1.5rem;

        @media (max-width: 768px) {
          width: 70px;
          height: 70px;
        }

        @media (max-width: 480px) {
          width: 60px;
          height: 60px;
        }

        .avatar-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.15);
          transition: all 0.4s ease;
          pointer-events: none;
        }

        @media (hover: hover) {
          &:hover .avatar-ring {
            box-shadow: 0 0 24px rgba(201, 168, 124, 0.4);
            border-color: var(--accent);
            transform: scale(1.08);
          }
        }

        .avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 0 20px rgba(201, 168, 124, 0.15);
        }
      }

      .stars {
        margin-bottom: 1.25rem;
        display: flex;
        justify-content: center;
        gap: 0.3rem;

        .fa-star {
          font-size: clamp(1rem, 1.8vw, 1.3rem);
          transition: all 0.3s ease;

          &.star--filled {
            color: #f1c40f;
          }

          &.star--empty {
            color: rgba(255, 255, 255, 0.15);
          }

          &.star--pop {
            animation: starPopIn 0.45s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
            animation-delay: var(--star-delay, 0s);
          }
        }
      }

      @keyframes starPopIn {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.35); }
        100% { transform: scale(1); opacity: 1; }
      }

      .quote {
        font-size: clamp(1rem, 1.6vw, 1.15rem);
        font-style: italic;
        color: var(--text-primary);
        line-height: 1.7;
        margin-bottom: 1.5rem;
        font-weight: 300;
      }

      .author {
        strong {
          display: block;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          font-size: 1.05rem;
        }

        span {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 300;
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
    font-weight: 300;
  }

  .dots {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    margin-top: 2rem;
    position: relative;
    z-index: 1;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: none;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      padding: 0;
      will-change: width;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      &.dot--active {
        width: 35px;
        border-radius: 10px;
        background: var(--accent);
        box-shadow: 0 0 18px rgba(201, 168, 124, 0.4);
        cursor: default;

        @media (max-width: 768px) {
          width: 25px;
        }

        @media (max-width: 480px) {
          width: 20px;
        }
      }

      @media (max-width: 480px) {
        width: 8px;
        height: 8px;

        &.dot--active {
          width: 20px;
          height: 8px;
        }
      }
    }
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

.slide-fade-rtl-enter-active,
.slide-fade-rtl-leave-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-fade-rtl-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}

.slide-fade-rtl-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
