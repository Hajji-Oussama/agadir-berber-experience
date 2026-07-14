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
          class="service-card-wrapper"
          data-aos="zoom-in-up"
          :data-aos-delay="index * 120"
          @click="handleBooking(service)"
          role="button"
          tabindex="0"
          @keydown.enter="handleBooking(service)"
        >
          <div class="service-card" :class="{ 'service-card--loaded': loadedImages.has(service.id), 'promo-vip-card': promoConfig.isActive && service.id === promoConfig.serviceId }">

            <div class="service-image-wrapper">
              <div class="service-image" :style="{ backgroundImage: `url(${service.image})` }"></div>
              <div class="shimmer" :class="{ 'shimmer--loaded': loadedImages.has(service.id) }"></div>

              <div class="service-tags" v-if="service.tags?.length && !(promoConfig.isActive && service.id === promoConfig.serviceId)">
                <span v-for="tag in service.tags" :key="tag" class="service-tag" :class="tagClass(tag)">{{ tag }}</span>
              </div>

              <template v-if="promoConfig.isActive && service.id === promoConfig.serviceId">
                <div class="vip-ribbon">
                  <span>{{ $t('promo.badge') }}</span>
                </div>
                <div class="vip-price-badge">
                  <span class="old-price">{{ formatPrice(promoConfig.basePriceMAD) }}</span>
                  <span class="new-price">{{ formatPrice(promoConfig.promoPriceMAD) }}</span>
                </div>
              </template>

              <div class="service-image-gradient"></div>
            </div>

            <div class="service-info" @click.stop>
              <h3>{{ service.name }}</h3>
              <div class="service-desc-wrap">
                <p :class="{ clamped: expandedService !== service.id }">{{ service.description }}</p>
                <button class="service-link" @click.stop="toggleExpand(service.id)">
                  {{ expandedService === service.id ? $t('services.less') : $t('services.more') }}
                  <i class="fas fa-chevron-down" :class="{ rotated: expandedService === service.id }"></i>
                </button>
              </div>

              <div class="service-footer-container">
                <div class="service-meta" :class="{ 'is-promo': promoConfig.isActive && service.id === promoConfig.serviceId }">
                  <template v-if="promoConfig.isActive && service.id === promoConfig.serviceId">
                    <div class="promo-meta-text">
                      <i class="fas fa-gift"></i> {{ $t('promo.badge') }}
                    </div>
                  </template>
                  <template v-else>
                    <span class="price">{{ formatPrice(service.price) }}</span>
                  </template>
                  <span class="duration"><i class="far fa-clock"></i> {{ service.duration }}</span>
                </div>

                <div class="service-actions">
                  <button class="btn-book" :class="{ 'btn-vip': promoConfig.isActive && service.id === promoConfig.serviceId }" @click.stop="handleBooking(service)">
                    {{ $t('services.book_now') }}
                  </button>
                </div>
              </div>
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
import { useCurrency } from '@/composables/useCurrency'
import promoConfig from '@/data/promoConfig.json'

const { locale } = useI18n()
const data = ref(null)
const loadedImages = reactive(new Set())
const { handleBooking } = useBooking()
const { formatPrice } = useCurrency()
const expandedService = ref(null)

function toggleExpand(id) {
  expandedService.value = expandedService.value === id ? null : id
}

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

  .service-card-wrapper {
    cursor: pointer;
    outline: none;
    perspective: 1000px;
    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
      border-radius: 24px;
    }
    &.card-highlight .service-card {
      animation: cardHighlight 1.5s ease;
    }
  }

  .service-card {
    display: flex;
    flex-direction: column;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    background: rgba(10, 14, 26, 0.95);
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    height: 100%;

    @media (hover: hover) {
      &:hover {
        transform: translateY(-10px);
        border-color: var(--accent);
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
        .service-image { filter: brightness(1.1); }
      }
    }
  }

  @keyframes cardHighlight {
    0%, 100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25); border-color: rgba(255, 255, 255, 0.08); }
    25% { box-shadow: 0 0 40px rgba(201, 168, 124, 0.6); border-color: var(--accent); transform: translateY(-5px); }
    50% { box-shadow: 0 0 30px rgba(201, 168, 124, 0.4); border-color: var(--accent); }
    75% { box-shadow: 0 0 40px rgba(201, 168, 124, 0.6); border-color: var(--accent); transform: translateY(-3px); }
  }

  .service-image-wrapper {
    position: relative;
    height: 220px;
    overflow: hidden;
    border-radius: 24px 24px 0 0;

    @media (min-width: 768px) { height: 260px; }

    .service-image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      transition: transform 0.6s ease;
    }

    .promo-vip-card:hover & .service-image {
      transform: scale(1.08);
    }
  }

  .service-image-gradient {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 70px;
    background: linear-gradient(transparent, rgba(10, 14, 26, 0.8));
    z-index: 1;
  }

  .service-tags {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
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

  .promo-vip-card {
    border: 1px solid rgba(212, 175, 55, 0.4) !important;
    background: linear-gradient(180deg, rgba(10, 14, 26, 0.98) 0%, rgba(30, 10, 15, 0.95) 100%) !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(212, 175, 55, 0.05) !important;
    position: relative;
    transition: all 0.4s ease;

    &:hover {
      border-color: rgba(212, 175, 55, 0.8) !important;
      box-shadow: 0 15px 50px rgba(212, 175, 55, 0.15), 0 8px 32px rgba(0, 0, 0, 0.5) !important;
    }
  }

  .vip-ribbon {
    position: absolute;
    top: 20px;
    left: -40px;
    background: linear-gradient(135deg, #8B0000 0%, #B22222 100%);
    color: #F8E5A5;
    padding: 8px 45px;
    transform: rotate(-45deg);
    z-index: 15;
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
    border-top: 1px solid rgba(248, 229, 165, 0.5);
    border-bottom: 1px solid rgba(248, 229, 165, 0.5);
    text-align: center;
    width: 170px;
    pointer-events: none;

    [dir="rtl"] & {
      left: auto;
      right: -40px;
      transform: rotate(45deg);
    }
  }

  .vip-price-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(20, 5, 8, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(212, 175, 55, 0.6);
    border-radius: 16px;
    padding: 10px 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 15;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
    transform: translateZ(0);
    animation: subtleFloat 4s ease-in-out infinite;

    [dir="rtl"] & {
      right: auto;
      left: 15px;
    }

    .old-price {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
      text-decoration: line-through;
      text-decoration-color: #e74c3c;
      margin-bottom: 2px;
    }

    .new-price {
      font-size: clamp(1.2rem, 3vw, 1.5rem);
      font-family: var(--font-heading);
      color: #F8E5A5;
      font-weight: 700;
      line-height: 1;
      text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
    }
  }

  @keyframes subtleFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  .service-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1.4rem 1.6rem 1.6rem;
    background: rgba(10, 14, 26, 0.95);

    h3 {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 400;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      flex-shrink: 0;
    }
  }

  .service-desc-wrap {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    margin-bottom: 0.75rem;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }

    p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 300;
      line-height: 1.6;
      margin-bottom: 0.5rem;

      &.clamped {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .service-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--accent);
      font-size: 0.8rem;
      font-weight: 500;
      background: transparent;
      border: none;
      cursor: pointer;
      font-family: inherit;
      padding: 0.25rem 0;

      i {
        font-size: 0.65rem;
        transition: transform 0.3s ease;
        &.rotated { transform: rotate(180deg); }
      }
    }
  }

  .service-footer-container {
    flex-shrink: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding-top: 0.75rem;
    margin-top: auto;

    .service-meta {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      margin-bottom: 0.8rem;
      flex-wrap: wrap;

      &.is-promo {
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .promo-meta-text {
        color: #D4AF37;
        font-weight: 600;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 6px;
        letter-spacing: 0.05em;
        text-transform: uppercase;

        i {
          font-size: 1rem;
          animation: subtlePulse 2.5s infinite;
        }
      }

      .price {
        font-family: var(--font-heading);
        color: var(--accent);
        font-size: 2rem;
        font-weight: 600;
        line-height: 1.1;
        small { font-size: 1rem; font-weight: 300; opacity: 0.8; }
      }

      .duration {
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 300;
        i { margin-right: 0.3rem; }
      }
    }

    .service-actions {
      .btn-book {
        width: 100%;
        padding: 0.7rem 1.2rem;
        background: var(--accent);
        color: #000;
        border-radius: 60px;
        font-size: 0.85rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;

        &:hover { background: #d4b88a; transform: scale(1.02); }
        &:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 4px;
        }
      }

      .btn-vip {
        background: linear-gradient(135deg, #D4AF37 0%, #AA8111 100%) !important;
        color: #0A0E1A !important;
        box-shadow: 0 5px 20px rgba(212, 175, 55, 0.3) !important;

        &:hover {
          background: linear-gradient(135deg, #F8E5A5 0%, #D4AF37 100%) !important;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5) !important;
          transform: translateY(-2px);
        }
      }
    }

    @keyframes subtlePulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
  }
}
</style>
