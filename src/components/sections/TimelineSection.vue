<template>
  <section class="timeline-section section-padding" id="timeline">
    <div class="timeline-bg" aria-hidden="true">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <span class="eyebrow">{{ $t('timeline.eyebrow') }}</span>
        <h2 class="section-title">{{ $t('timeline.title') }}</h2>
        <p class="section-subtitle">{{ $t('timeline.subtitle') }}</p>
      </div>

      <div class="timeline">
        <div class="timeline-line" ref="timelineLine"></div>

        <div
          v-for="(step, index) in steps"
          :key="index"
          class="timeline-item"
          :class="{
            'timeline-item--right': index % 2 === 1,
            'timeline-item--left': index % 2 === 0
          }"
          ref="timelineItems"
          data-aos="fade-up"
          :data-aos-delay="index * 150"
        >
          <div
            class="timeline-image"
            :style="{ backgroundImage: `url(${step.image})` }"
          ></div>

          <div class="timeline-glow" :style="{ background: `radial-gradient(circle, ${step.color}30, transparent 70%)` }"></div>

          <div class="timeline-dot" :style="{ background: step.color }">
            <span>{{ index + 1 }}</span>
          </div>

          <div class="timeline-content glass-card">
            <div class="timeline-step">
              <span class="step-number">{{ String(index + 1).padStart(2, '0') }}</span>
              <h4>{{ $t(`timeline.step${index + 1}`) }}</h4>
            </div>
            <p>{{ $t(`timeline.step${index + 1}_desc`) }}</p>
            <div class="step-meta" v-if="step.meta">
              <span><i class="fas fa-clock"></i> {{ step.meta.duration }}</span>
              <span><i class="fas fa-mountain"></i> {{ step.meta.elevation }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const timelineLine = ref(null)
const timelineItems = ref([])

const steps = [
  {
    image: 'https://res.cloudinary.com/nczftcee/image/upload/v1782838977/WhatsApp_Image_2026-06-29_at_3.27.55_PM_uc767s.jpg',
    color: '#c9a87c',
    meta: { duration: '2 Days', elevation: '1,200m' }
  },
  {
    image: 'https://res.cloudinary.com/nczftcee/image/upload/v1782839101/WhatsApp_Image_2026-06-29_at_3.27.57_PM_5_ihself.jpg',
    color: '#7fb5d0',
    meta: { duration: '3 Days', elevation: '2,500m' }
  },
  {
    image: 'https://res.cloudinary.com/nczftcee/image/upload/v1782846362/0e3be529-7629-4fcc-ab05-303f5fd381e2.png',
    color: '#d4a373',
    meta: { duration: '4 Days', elevation: '3,800m' }
  },
  {
    image: 'https://res.cloudinary.com/nczftcee/image/upload/v1782839101/WhatsApp_Image_2026-06-29_at_3.27.57_PM_4_agtshs.jpg',
    color: '#6b8c7c',
    meta: { duration: '5 Days', elevation: '5,200m' }
  },
  {
    image: 'https://res.cloudinary.com/nczftcee/image/upload/v1782839037/WhatsApp_Image_2026-06-29_at_3.27.59_PM_1_dmcdyq.jpg',
    color: '#e8a060',
    meta: { duration: '3 Days', elevation: '1,800m' }
  }
]

let scrollObserver = null
let lineObserver = null

onMounted(() => {
  const line = timelineLine.value
  if (line) {
    lineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          line.style.height = '100%'
        }
      })
    }, { threshold: 0.2 })
    lineObserver.observe(line)
  }

  const itemEls = timelineItems.value
  if (itemEls.length) {
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        const items = itemEls
        const idx = items.findIndex(el => el === entry.target)
        if (idx === -1) return
        if (entry.isIntersecting) {
          const img = entry.target.querySelector('.timeline-image')
          if (img) {
            const speed = 0.05
            const offset = (entry.target.getBoundingClientRect().top - window.innerHeight / 2) * speed
            img.style.transform = `translateY(${offset}px) scale(1.05)`
          }
        }
      })
    }, { threshold: 0.1 })

    itemEls.forEach(el => scrollObserver.observe(el))

    window.addEventListener('scroll', handleParallax, { passive: true })
  }
})

onBeforeUnmount(() => {
  if (lineObserver) lineObserver.disconnect()
  if (scrollObserver) scrollObserver.disconnect()
  window.removeEventListener('scroll', handleParallax)
})

function handleParallax() {
  const items = timelineItems.value
  if (!items.length) return
  items.forEach(item => {
    const rect = item.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const img = item.querySelector('.timeline-image')
      if (img) {
        const offset = (rect.top - window.innerHeight / 2) * 0.05
        img.style.transform = `translateY(${offset}px) scale(1.05)`
      }
    }
  })
}
</script>

<style scoped lang="scss">
.timeline-section {
  position: relative;
  z-index: 1;
  overflow: hidden;
  background: var(--bg-gradient);

  .timeline-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;

    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.2;

      &.blob-1 {
        width: 500px;
        height: 500px;
        background: var(--accent);
        top: -10%;
        right: -10%;
        animation: floatBlob 20s ease-in-out infinite;
      }

      &.blob-2 {
        width: 400px;
        height: 400px;
        background: #7fb5d0;
        bottom: -10%;
        left: -10%;
        animation: floatBlob 25s ease-in-out infinite reverse;
      }
    }
  }

  @keyframes floatBlob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }

  .section-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 4rem;
    position: relative;
    z-index: 1;

    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 1rem;
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: clamp(2.2rem, 5vw, 3.5rem);
      font-weight: 300;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .section-subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
      font-weight: 300;
      line-height: 1.6;
    }
  }

  .timeline {
    position: relative;
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 0;
    z-index: 1;

    .timeline-line {
      position: absolute;
      left: 50%;
      top: 0;
      width: 3px;
      height: 0%;
      background: linear-gradient(to bottom, var(--accent), transparent);
      transform: translateX(-50%);
      transition: height 1.5s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 0 20px rgba(201, 168, 124, 0.3);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -10px;
        right: -10px;
        height: 20px;
        background: linear-gradient(to bottom, var(--accent), transparent);
        filter: blur(10px);
      }

      @media (max-width: 768px) {
        left: 24px;
      }
    }

    .timeline-item {
      position: relative;
      width: 50%;
      padding: 2rem 3rem;
      margin-bottom: 2rem;

      .timeline-image {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        border-radius: 24px;
        opacity: 0.15;
        transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease;
        will-change: transform;
        z-index: 0;

        @media (hover: hover) {
          &:hover {
            opacity: 0.25;
            transform: scale(1.03);
          }
        }
      }

      .timeline-glow {
        position: absolute;
        inset: -20px;
        border-radius: 40px;
        opacity: 0.4;
        transition: opacity 0.6s ease;
        z-index: 0;
        pointer-events: none;
      }

      &:hover .timeline-glow {
        opacity: 0.8;
      }

      &.timeline-item--left {
        left: 0;
        text-align: right;
        padding-right: 4rem;

        .timeline-dot {
          right: -11px;
        }

        .timeline-content {
          margin-right: 0;
        }
      }

      &.timeline-item--right {
        left: 50%;
        text-align: left;
        padding-left: 4rem;

        .timeline-dot {
          left: -11px;
        }

        .timeline-content {
          margin-left: 0;
        }
      }

      @media (max-width: 768px) {
        width: 100% !important;
        left: 0 !important;
        padding: 1rem 0 1rem 4rem !important;
        text-align: left !important;

        .timeline-dot {
          left: 20px !important;
          right: auto !important;
        }

        .timeline-image {
          border-radius: 16px;
          opacity: 0.1;
        }

        .timeline-glow {
          opacity: 0.2;
        }
      }

      .timeline-dot {
        position: absolute;
        top: 2.5rem;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3;
        box-shadow: 0 0 30px rgba(201, 168, 124, 0.4);
        transition: all 0.4s ease;
        color: #fff;
        font-weight: 600;
        font-size: 0.9rem;

        &::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--accent);
          opacity: 0.3;
          animation: pulseDot 2s ease-in-out infinite;
        }

        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0; }
        }

        @media (max-width: 768px) {
          width: 32px;
          height: 32px;
          font-size: 0.75rem;
          top: 2rem;
        }
      }

      .timeline-content {
        padding: 2rem 2.5rem;
        background: rgba(255, 255, 255, 0.04);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        position: relative;
        z-index: 2;
        transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);

        &:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          padding: 1.5rem;
        }

        .timeline-step {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.8rem;

          .step-number {
            font-family: var(--font-heading);
            font-size: 1.8rem;
            font-weight: 300;
            color: var(--accent);
            line-height: 1;
          }

          h4 {
            font-family: var(--font-heading);
            font-size: 1.4rem;
            font-weight: 400;
            color: var(--text-primary);
            margin: 0;
          }

          @media (max-width: 768px) {
            .step-number { font-size: 1.4rem; }
            h4 { font-size: 1.2rem; }
          }
        }

        p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 300;
          line-height: 1.6;
          margin: 0 0 1rem;
        }

        .step-meta {
          display: flex;
          gap: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);

          span {
            font-size: 0.8rem;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 0.4rem;

            i {
              color: var(--accent);
              font-size: 0.75rem;
            }
          }

          @media (max-width: 480px) {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      }
    }
  }
}

.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
