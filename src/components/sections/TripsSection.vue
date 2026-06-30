<template>
  <section class="trips-section section-padding section-anchor" id="trips">
    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <span class="eyebrow">{{ $t('trips.eyebrow') }}</span>
        <h2 class="section-title">{{ data?.title }}</h2>
        <p class="section-subtitle">{{ data?.subtitle }}</p>
      </div>

      <div class="trips-grid" v-if="data?.trips?.length">
        <div
          v-for="(trip, index) in data.trips"
          :key="trip.id"
          :data-id="trip.id"
          class="trip-card-wrapper"
          data-aos="zoom-in-up"
          :data-aos-delay="index * 150"
          @click="handleBooking(trip)"
          role="button"
          tabindex="0"
          @keydown.enter="handleBooking(trip)"
        >
          <div
            class="trip-card"
            :class="{ 'trip-card--loaded': loadedImages.has(trip.id) }"
            :style="{ '--accent-color': trip.accentColor || 'var(--accent)' }"
          >
            <div class="trip-image" :style="{ backgroundImage: `url(${trip.image})` }">
              <div class="shimmer" :class="{ 'shimmer--loaded': loadedImages.has(trip.id) }"></div>

              <div class="trip-tags" v-if="trip.tags?.length">
                <span
                  v-for="tag in trip.tags"
                  :key="tag"
                  class="trip-tag"
                  :class="tagClass(tag)"
                >{{ tag }}</span>
              </div>

              <div class="trip-badge">
                <span class="places"><i class="fas fa-users"></i> {{ trip.places }} {{ $t('trips.places') }}</span>
                <span class="duration"><i class="far fa-clock"></i> {{ trip.duration }}</span>
              </div>
              <div class="trip-overlay-gradient"></div>
            </div>

            <div class="trip-info" @click.stop>
              <h3>{{ trip.name }}</h3>
              <p>{{ trip.description }}</p>
              <div class="trip-meta">
                <span class="price">{{ $t('trips.price', { price: trip.price }) }}</span>
                <span class="rating">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              </div>
              <button class="btn-book" @click.stop="handleBooking(trip)">
                {{ $t('trips.book') }}
                <span class="arrow">&rarr;</span>
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
import { fetchTrips } from '@/services/api'
import { useBooking } from '@/composables/useBooking'

const { locale } = useI18n()
const data = ref(null)
const loadedImages = reactive(new Set())
const { handleBooking } = useBooking()

watch(locale, async (newLocale) => {
  data.value = await fetchTrips(newLocale)
}, { immediate: true })

function tagClass(tag) {
  const lower = tag.toLowerCase()
  if (lower.includes('best') || lower.includes('vente') || lower.includes('مبيع')) return 'tag--best-seller'
  if (lower.includes('limit') || lower.includes('limited') || lower.includes('محدود')) return 'tag--limited'
  if (lower.includes('couple') || lower.includes('romantic') || lower.includes('رومانسي') || lower.includes('أزواج')) return 'tag--couples'
  if (lower.includes('premium') || lower.includes('ممتاز')) return 'tag--premium'
  if (lower.includes('cultural') || lower.includes('culturel') || lower.includes('ثقافي')) return 'tag--cultural'
  return ''
}

watch(data, (val) => {
  if (!val?.trips) return
  val.trips.forEach(item => {
    const img = new Image()
    img.onload = () => { loadedImages.add(item.id) }
    img.onerror = () => { loadedImages.add(item.id) }
    img.src = item.image
  })
})
</script>

<style scoped lang="scss">
.trips-section {
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

  .trips-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 2.5rem;
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
      gap: 3rem;
    }

    @media (min-width: 1440px) {
      grid-template-columns: repeat(4, 1fr);
      gap: 3.5rem;
    }
  }

  .trip-card-wrapper {
    perspective: 1000px;
    cursor: pointer;
    outline: none;

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
      border-radius: 24px;
    }

    &.card-highlight .trip-card {
      animation: cardHighlight 1.5s ease;
    }
  }

  @keyframes cardHighlight {
    0%, 100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); border-color: rgba(255, 255, 255, 0.08); }
    25% { box-shadow: 0 0 40px rgba(201, 168, 124, 0.6); border-color: var(--accent-color, var(--accent)); transform: translateY(-5px); }
    50% { box-shadow: 0 0 30px rgba(201, 168, 124, 0.4); border-color: var(--accent-color, var(--accent)); }
    75% { box-shadow: 0 0 40px rgba(201, 168, 124, 0.6); border-color: var(--accent-color, var(--accent)); transform: translateY(-3px); }
  }

  .trip-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    height: 100%;
    display: flex;
    flex-direction: column;

    &.card-highlight {
      animation: cardHighlight 1.5s ease;
    }

    @media (hover: hover) {
      transition: transform 0.3s ease, box-shadow 0.5s ease;
      transform-style: preserve-3d;
      will-change: transform;

      &:hover {
        transform: translateY(-10px) rotateX(2deg) rotateY(4deg) scale(1.02);
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        border-color: var(--accent-color, var(--accent));
      }
    }

    @media (hover: none) {
      &:active { transform: scale(0.98); }
    }

    .trip-image {
      position: relative;
      height: 220px;
      background-size: cover;
      background-position: center;
      overflow: hidden;
      flex-shrink: 0;
      background-color: rgba(255, 255, 255, 0.03);

      @media (min-width: 768px) { height: 260px; }

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.7) 100%);
        opacity: 0.6;
        transition: opacity 0.4s ease;
        z-index: 1;
      }

      .trip-tags {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        z-index: 3;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .trip-tag {
        padding: 0.2rem 0.7rem;
        border-radius: 30px;
        font-size: 0.6rem;
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

        &.tag--cultural {
          background: rgba(52, 152, 219, 0.75);
          color: #fff;
          border-color: rgba(52, 152, 219, 0.3);
        }

        &:not(.tag--best-seller):not(.tag--limited):not(.tag--couples):not(.tag--premium):not(.tag--cultural) {
          background: rgba(255, 255, 255, 0.12);
          color: var(--text-primary);
        }
      }

      .trip-badge {
        position: absolute;
        top: 1rem;
        left: 1rem;
        z-index: 2;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .places {
          background: rgba(255, 255, 255, 0.9);
          color: #000;
          padding: 0.3rem 1rem;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          i { margin-right: 0.3rem; font-size: 0.65rem; }
        }

        .duration {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          color: #fff;
          padding: 0.3rem 1rem;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 400;
          i { margin-right: 0.3rem; }
        }
      }

      .trip-overlay-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: 1;
      }
    }

    .trip-info {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;

      @media (min-width: 768px) { padding: 2rem; }

      h3 {
        font-family: var(--font-heading);
        font-size: 1.4rem;
        font-weight: 400;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
        line-height: 1.2;
      }

      p {
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 300;
        margin-bottom: 1.2rem;
        line-height: 1.5;
        flex: 1;
      }

      .trip-meta {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 1.2rem;

        .price {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          color: var(--accent-color, var(--accent));
          font-weight: 600;
          line-height: 1.1;
        }

        .rating {
          color: #f1c40f;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
        }
      }

      .btn-book {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.8rem;
        width: 100%;
        padding: 0.8rem 1.5rem;
        background: var(--accent-color, var(--accent));
        color: #000;
        border-radius: 60px;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        text-decoration: none;

        .arrow { display: inline-block; transition: transform 0.3s ease; }

        &:hover {
          background: #d4b88a;
          transform: scale(1.03);
          box-shadow: 0 8px 25px rgba(201, 168, 124, 0.3);

          .arrow { transform: translateX(6px); }
        }
      }
    }

    &:hover {
      .trip-image::after { opacity: 0.3; }
      .trip-overlay-gradient { opacity: 1; }
    }
  }
}
</style>
