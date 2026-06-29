<template>
  <section class="services-section section-padding section-anchor" id="services">
    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <span class="eyebrow">{{ $t('services.eyebrow') }}</span>
        <h2 class="section-title">{{ data.title }}</h2>
        <p class="section-subtitle">{{ data.subtitle }}</p>
      </div>

      <div class="services-grid">
        <div
          v-for="(service, index) in data.services"
          :key="service.id"
          class="service-card"
          data-aos="zoom-in-up"
          :data-aos-delay="index * 120"
          :style="{ backgroundImage: `url(${service.image})` }"
        >
          <div class="service-overlay">
            <h3>{{ service.name }}</h3>
            <p>{{ service.description }}</p>
            <div class="service-meta">
              <span class="price">{{ service.price }} Dhs</span>
              <span class="duration">{{ service.duration }}</span>
            </div>
            <div class="service-actions">
              <router-link :to="service.link" class="service-link">
                {{ $t('services.learn_more') }}
                <span class="arrow">&rarr;</span>
              </router-link>
              <a :href="service.bookLink" target="_blank" rel="noopener" class="btn-book">
                {{ $t('services.book_now') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getServices } from '@/data'

const { locale } = useI18n()
const data = computed(() => getServices(locale.value))
</script>

<style scoped lang="scss">
.services-section {
  position: relative;
  z-index: 1;

  .section-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 4rem;

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

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;

    @media (min-width: 640px) { gap: 2.5rem; }
    @media (min-width: 1024px) { gap: 3rem; }
  }

  .service-card {
    position: relative;
    min-height: 380px;
    border-radius: 24px;
    background-size: cover;
    background-position: center;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);

    @media (min-width: 768px) { min-height: 450px; }

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
      transition: opacity 0.5s ease;
    }

    &:hover {
      transform: translateY(-10px);
      border-color: var(--accent);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);

      &::before { opacity: 0.7; }

      .service-overlay {
        background: rgba(10, 14, 26, 0.75);
        backdrop-filter: blur(16px);
      }

      .arrow { transform: translateX(6px); }
    }
  }

  .service-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem 1.8rem 2.2rem;
    background: rgba(10, 14, 26, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: all 0.5s ease;
    z-index: 2;

    @media (min-width: 768px) { padding: 2.5rem 2.5rem 3rem; }

    h3 {
      font-family: var(--font-heading);
      font-size: 1.6rem;
      font-weight: 400;
      color: var(--text-primary);
      margin-bottom: 0.4rem;
    }

    p {
      color: var(--text-secondary);
      font-weight: 300;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 0.75rem;
      max-width: 90%;
    }

    .service-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      .price {
        font-family: var(--font-heading);
        color: var(--accent);
        font-size: 1.1rem;
        font-weight: 400;
      }

      .duration {
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 300;
      }
    }

    .service-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;

      .service-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--accent);
        font-size: 0.85rem;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-decoration: none;
        transition: all 0.3s ease;

        .arrow { display: inline-block; transition: transform 0.3s ease; }
      }

      .btn-book {
        padding: 0.5rem 1.2rem;
        background: var(--accent);
        color: #000;
        border-radius: 60px;
        font-size: 0.8rem;
        font-weight: 600;
        transition: all 0.3s ease;
        text-decoration: none;
        border: none;
        cursor: pointer;

        &:hover {
          background: #d4b88a;
          transform: scale(1.05);
        }
      }
    }
  }
}
</style>
