<template>
  <section class="stats-section section-padding" ref="sectionRef">
    <div class="stats-bg" aria-hidden="true">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

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
          :style="{ '--stat-color': stat.color }"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = -1"
          :class="{ 'stat-card--hovered': hoveredIndex === index }"
          :aria-label="`${$t(`stats.${stat.key}`)}: ${stat.value}${stat.suffix}`"
        >
          <div class="stat-accent"></div>

          <div class="stat-icon-wrapper">
            <i :class="['fas', stat.icon, { 'stat-icon--animated': hoveredIndex === index }]"></i>
          </div>

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
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const sectionRef = ref(null)
const counterRefs = ref([])
const hoveredIndex = ref(-1)
let observer = null

const stats = [
  { id: 1, key: 'trips', value: 500, suffix: '+', icon: 'fa-route', color: '#c9a87c' },
  { id: 2, key: 'clients', value: 3000, suffix: '+', icon: 'fa-users', color: '#7fb5d0' },
  { id: 3, key: 'years', value: 10, suffix: '+', icon: 'fa-calendar-alt', color: '#d4a373' },
  { id: 4, key: 'destinations', value: 5, suffix: '', icon: 'fa-map-marked-alt', color: '#6b8c7c' }
]

function animateCounter(el, target, duration = 1800) {
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
            animateCounter(el, stats[index].value)
          }
        })
        if (observer) observer.disconnect()
      }
    })
  }, { threshold: 0.3 })

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

  .stats-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;

    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.1;

      &.blob-1 {
        width: 400px;
        height: 400px;
        background: #c9a87c;
        top: -10%;
        right: -5%;
        animation: floatBlob 22s ease-in-out infinite;
      }

      &.blob-2 {
        width: 300px;
        height: 300px;
        background: #7fb5d0;
        bottom: 5%;
        left: -5%;
        animation: floatBlob 28s ease-in-out infinite reverse;
      }

      &.blob-3 {
        width: 200px;
        height: 200px;
        background: #d4a373;
        top: 40%;
        left: 50%;
        animation: floatBlob 30s ease-in-out infinite 8s;
      }
    }
  }

  @keyframes floatBlob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.08); }
    66% { transform: translate(-20px, 15px) scale(0.92); }
  }

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
      padding: 2rem 1.5rem;
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      text-align: center;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      overflow: hidden;
      min-height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
      will-change: transform;

      @media (min-width: 768px) {
        padding: 2.5rem 2rem;
        min-height: 220px;
      }

      @media (min-width: 1024px) {
        padding: 3rem 2.5rem;
        min-height: 250px;
      }

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 24px;
        opacity: 0;
        transition: opacity 0.4s ease;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.03) 0%,
          transparent 50%
        );
        pointer-events: none;
      }

      &.stat-card--hovered {
        transform: translateY(-8px);
        border-color: var(--stat-color, var(--accent));
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
          0 0 40px rgba(var(--stat-color, 201, 168, 124), 0.15);

        &::before {
          opacity: 1;
        }

        .stat-icon-wrapper i {
          transform: scale(1.15) rotate(-5deg);
        }
      }

      .stat-accent {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--stat-color, var(--accent));
        border-radius: 24px 24px 0 0;
        opacity: 0.6;
        transition: opacity 0.3s ease;
      }

      &:hover .stat-accent {
        opacity: 1;
      }

      .stat-icon-wrapper {
        margin-bottom: 0.5rem;

        i {
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          color: var(--stat-color, var(--accent));
          transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          will-change: transform;
        }
      }

      .stat-value {
        font-family: var(--font-heading);
        font-size: clamp(2.8rem, 6vw, 4.5rem);
        font-weight: 300;
        color: var(--stat-color, var(--accent));
        line-height: 1.1;
        display: flex;
        align-items: center;
        justify-content: center;

        .suffix {
          font-size: 0.65em;
          color: var(--text-secondary);
          margin-left: 0.05em;
        }
      }

      .stat-label {
        font-family: var(--font-body);
        font-size: clamp(0.7rem, 1vw, 0.85rem);
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--text-secondary);
        margin-top: 0.3rem;
        font-weight: 400;
      }
    }
  }
}
</style>
