<template>
  <section class="stats-section section-padding" id="stats" ref="sectionRef">
    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <span class="eyebrow">{{ $t('stats.eyebrow') }}</span>
        <h2 class="section-title">{{ $t('stats.title') }}</h2>
        <p class="section-subtitle">{{ $t('stats.subtitle') }}</p>
      </div>

      <div class="stats-grid" data-aos="fade-up" data-aos-delay="100">
        <div
          v-for="(stat, index) in stats"
          :key="stat.id"
          class="stat-card"
          :style="{ '--stat-color': stat.color, '--stat-overlay': stat.overlay }"
          :class="{ 'stat-card--hovered': hoveredIndex === index }"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = -1"
          :aria-label="`${$t(`stats.${stat.key}`)}: ${stat.value}${stat.suffix}`"
        >
          <div class="stat-media">
            <img
              v-if="stat.image && !stat.video"
              :src="stat.image"
              alt=""
              class="stat-img"
              loading="lazy"
            />
            <video
              v-if="stat.video"
              :src="stat.video"
              autoplay
              muted
              loop
              playsinline
              class="stat-video"
              @error="handleVideoError(index)"
            ></video>
          </div>

          <div class="stat-overlay"></div>

          <div class="stat-accent" aria-hidden="true"></div>

          <div class="stat-content">
            <div class="stat-value">
              <span
                :ref="el => { if (el) counterRefs[index] = el }"
                class="counter"
              >0</span>
              <span class="suffix">{{ stat.suffix }}</span>
            </div>
            <span class="stat-label">{{ $t(`stats.${stat.key}`) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { getStats } from '@/data'

const { locale } = useI18n()
const data = computed(() => getStats(locale.value))

const sectionRef = ref(null)
const counterRefs = ref([])
const hoveredIndex = ref(-1)
const videoErrors = ref([])
let observer = null

const stats = computed(() => data.value.stats || [])

function handleVideoError(index) {
  videoErrors.value[index] = true
}

function animateCounter(el, target, duration = 1500) {
  let start = 0
  const startTime = performance.now()

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.floor(eased * target)
    el.textContent = current
    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      el.textContent = target
    }
  }

  requestAnimationFrame(update)
}

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counterRefs.value.forEach((el, index) => {
          if (el) {
            animateCounter(el, stats.value[index].value)
          }
        })
        if (observer) observer.disconnect()
      }
    })
  }, { threshold: 0.2 })

  if (sectionRef.value) {
    observer.observe(sectionRef.value)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped lang="scss">
.stats-section {
  position: relative;
  z-index: 1;
  overflow: hidden;
  background: var(--bg-gradient);

  .section-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 3rem;
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

  .stats-grid {
    display: grid;
    gap: 1rem;
    position: relative;
    z-index: 1;

    grid-template-columns: 1fr;

    @media (min-width: 481px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.2rem;
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .stat-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      min-height: 200px;
      cursor: pointer;
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
                  box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform;
      display: flex;
      align-items: center;
      justify-content: center;

      @media (min-width: 481px) {
        min-height: 220px;
      }

      @media (min-width: 768px) {
        min-height: 250px;
      }

      @media (min-width: 1024px) {
        min-height: 280px;
      }

      &.stat-card--hovered {
        transform: translateY(-6px) scale(1.02);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4),
                    0 0 50px rgba(var(--stat-color, 201, 168, 124), 0.15);

        .stat-img {
          transform: scale(1.08);
        }

        .stat-video {
          transform: scale(1.08);
        }

        .stat-overlay {
          opacity: 0.85;
        }

        .stat-accent {
          opacity: 1;
        }
      }

      .stat-media {
        position: absolute;
        inset: 0;
        z-index: 0;

        .stat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.6) saturate(1.1);
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        .stat-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.8;
          filter: brightness(0.5);
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
      }

      .stat-overlay {
        position: absolute;
        inset: 0;
        z-index: 1;
        background: var(--stat-overlay, linear-gradient(135deg, rgba(10,14,26,0.8) 0%, rgba(0,0,0,0.2) 100%));
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        transition: opacity 0.5s ease;
      }

      .stat-accent {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 4px;
        z-index: 3;
        background: var(--stat-color, var(--accent));
        opacity: 0.7;
        transition: opacity 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 0 0 12px rgba(var(--stat-color, 201, 168, 124), 0.3);
        border-radius: 0 2px 2px 0;

        [dir="rtl"] & {
          left: auto;
          right: 0;
          border-radius: 2px 0 0 2px;
        }
      }

      .stat-content {
        position: relative;
        z-index: 2;
        text-align: center;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;

        @media (min-width: 768px) {
          padding: 2rem;
        }

        @media (min-width: 1024px) {
          padding: 2.5rem;
        }

        .stat-value {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 10vw, 3rem);
          font-weight: 300;
          color: var(--stat-color, var(--accent));
          line-height: 1.1;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;

          @media (min-width: 481px) {
            font-size: clamp(2.8rem, 10vw, 3.5rem);
          }

          @media (min-width: 768px) {
            font-size: clamp(3rem, 8vw, 4rem);
          }

          @media (min-width: 1024px) {
            font-size: clamp(3.5rem, 6vw, 5rem);
          }

          .suffix {
            font-size: 0.65em;
            color: var(--text-secondary);
            margin-left: 0.05em;
            text-shadow: none;
          }
        }

        .stat-label {
          font-family: var(--font-body);
          font-size: clamp(0.75rem, 2vw, 0.85rem);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 400;
          text-shadow: 0 1px 10px rgba(0, 0, 0, 0.3);

          @media (min-width: 768px) {
            font-size: 0.9rem;
          }

          @media (min-width: 1024px) {
            font-size: 1rem;
          }
        }
      }
    }
  }
}
</style>
