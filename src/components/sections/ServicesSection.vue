<template>
  <section class="services-section section-padding section-anchor" id="services">
    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <span class="eyebrow">{{ $t('services.eyebrow') }}</span>
        <h2 class="section-title">{{ data?.title }}</h2>
        <p class="section-subtitle">{{ data?.subtitle }}</p>
      </div>

      <div class="services-grid" v-if="data?.services?.length">
        <div
          v-for="(service, index) in data.services"
          :key="service.id"
          :data-id="service.id"
          class="service-card"
          :class="{
            'card-highlight': false,
            'service-card--loaded': loadedImages.has(service.id)
          }"
          data-aos="zoom-in-up"
          :data-aos-delay="index * 120"
          :style="{ backgroundImage: `url(${service.image})` }"
          @click="handleBooking(service)"
          role="button"
          tabindex="0"
          @keydown.enter="handleBooking(service)"
        >
          <div class="shimmer" :class="{ 'shimmer--loaded': loadedImages.has(service.id) }"></div>

          <div class="service-tags" v-if="service.tags?.length">
            <span
              v-for="tag in service.tags"
              :key="tag"
              class="service-tag"
              :class="tagClass(tag)"
            >{{ tag }}</span>
          </div>

          <div class="service-overlay" @click.stop>
            <h3>{{ service.name }}</h3>
            <p>{{ service.description }}</p>
            <div class="service-meta">
              <span class="price">{{ service.price }} <small>{{ $t('services.currency') }}</small></span>
              <span class="duration"><i class="far fa-clock"></i> {{ service.duration }}</span>
            </div>
            <div class="service-actions">
              <router-link :to="service.link" class="service-link" @click.stop>
                {{ $t('services.learn_more') }}
                <span class="arrow">&rarr;</span>
              </router-link>
              <button class="btn-book" @click.stop="handleBooking(service)">
                {{ $t('services.book_now') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchServices } from '@/services/api'
import { useBooking } from '@/composables/useBooking'

const { locale } = useI18n()
const data = ref(null)
const loadedImages = reactive(new Set())
const { handleBooking } = useBooking()

watch(locale, async (newLocale) => {
  data.value = await fetchServices(newLocale)
}, { immediate: true })

function tagClass(tag) {
  const lower = tag.toLowerCase()
  if (lower.includes('best') || lower.includes('vente') || lower.includes('مبيع')) return 'tag--best-seller'
  if (lower.includes('limit') || lower.includes('limited') || lower.includes('محدود')) return 'tag--limited'
  if (lower.includes('couple') || lower.includes('romantic') || lower.includes('رومانسي') || lower.includes('أزواج')) return 'tag--couples'
  if (lower.includes('premium') || lower.includes('ممتاز')) return 'tag--premium'
  return ''
}

watch(data, (val) => {
  if (!val?.services) return
  val.services.forEach(item => {
    const img = new Image()
    img.onload = () => { loadedImages.add(item.id) }
    img.onerror = () => { loadedImages.add(item.id) }
    img.src = item.image
  })
})
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
    cursor: pointer;
    outline: none;
    background-color: rgba(255, 255, 255, 0.03);

    &.card-highlight {
      animation: cardHighlight 1.5s ease;
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
    }

    @media (min-width: 768px) { min-height: 450px; }

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
      transition: opacity 0.5s ease;
      z-index: 1;
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

  @keyframes cardHighlight {
    0%, 100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25); border-color: rgba(255, 255, 255, 0.08); }
    25% { box-shadow: 0 0 40px rgba(201, 168, 124, 0.6); border-color: var(--accent); transform: translateY(-5px); }
    50% { box-shadow: 0 0 30px rgba(201, 168, 124, 0.4); border-color: var(--accent); }
    75% { box-shadow: 0 0 40px rgba(201, 168, 124, 0.6); border-color: var(--accent); transform: translateY(-3px); }
  }

  .service-tags {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .service-tag {
    padding: 0.25rem 0.8rem;
    border-radius: 30px;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

    &.tag--best-seller {
      background: rgba(201, 168, 124, 0.85);
      color: #000;
      border-color: var(--accent);
    }

    &.tag--limited {
      background: rgba(231, 76, 60, 0.8);
      color: #fff;
      border-color: rgba(231, 76, 60, 0.3);
    }

    &.tag--couples {
      background: rgba(232, 126, 174, 0.75);
      color: #fff;
      border-color: rgba(232, 126, 174, 0.3);
    }

    &.tag--premium {
      background: rgba(255, 215, 0, 0.75);
      color: #000;
      border-color: rgba(255, 215, 0, 0.3);
    }

    &:not(.tag--best-seller):not(.tag--limited):not(.tag--couples):not(.tag--premium) {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text-primary);
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
      align-items: baseline;
      gap: 1rem;
      margin-bottom: 1rem;

      .price {
        font-family: var(--font-heading);
        color: var(--accent);
        font-size: 2rem;
        font-weight: 600;
        line-height: 1.1;

        small {
          font-size: 1rem;
          font-weight: 300;
          opacity: 0.8;
        }
      }

      .duration {
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 300;

        i { margin-right: 0.3rem; }
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
        outline: none;

        &:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 4px;
        }

        &:hover {
          background: #d4b88a;
          transform: scale(1.05);
        }
      }
    }
  }
}
</style>
