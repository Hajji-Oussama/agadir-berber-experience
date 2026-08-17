<template>
  <section class="services-section section-padding section-anchor" id="services">
    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <span class="eyebrow">{{ $t('services.eyebrow') }}</span>
        <h2 class="section-title">{{ $t('services.title') }}</h2>
        <p class="section-subtitle">{{ $t('services.subtitle') }}</p>
      </div>

      <div class="services-grid" v-if="experiences?.length">
        <div
          v-for="(experience, index) in experiences"
          :key="experience._path"
          class="service-card-wrapper"
          data-aos="zoom-in-up"
          :data-aos-delay="index * 120"
        >
          <article class="service-card">
            <div class="service-image-wrapper">
              <div class="service-image" :style="{ backgroundImage: `url(${experience.image})` }"></div>
              <div class="shimmer" :class="{ 'shimmer--loaded': loadedImages.has(experience._path) }"></div>
              <div class="service-image-gradient"></div>
            </div>

            <div class="service-info">
              <h3>
                <NuxtLink :to="experience._path">{{ experience.title }}</NuxtLink>
              </h3>
              <div class="service-desc-wrap">
                <p :class="{ clamped: expandedService !== experience._path }">{{ experience.description }}</p>
                <button class="service-link" @click.prevent.stop="toggleExpand(experience._path)">
                  {{ expandedService === experience._path ? $t('services.less') : $t('services.more') }}
                  <i class="fas fa-chevron-down" :class="{ rotated: expandedService === experience._path }"></i>
                </button>
              </div>

              <div class="service-footer-container">
                <div class="service-meta">
                  <span class="price">{{ formatPrice(experience.price) }}</span>
                  <span class="duration"><i class="far fa-clock"></i> {{ experience.duration }}</span>
                </div>
                <div class="service-actions">
                  <NuxtLink :to="experience._path" class="btn-book">{{ $t('services.book_now') }}</NuxtLink>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const { formatPrice } = useCurrency()

const { data: experiences } = await useAsyncData(
  `experiences-${locale.value}`,
  () => queryContent(`/${locale.value}/experiences`).find()
)

const loadedImages = reactive(new Set<string>())
const expandedService = ref<string | null>(null)

function toggleExpand(id: string) {
  expandedService.value = expandedService.value === id ? null : id
}

watch(experiences, (val) => {
  if (!val || !import.meta.client) return
  val.forEach((item) => {
    const img = new Image()
    img.onload = () => { loadedImages.add(item._path) }
    img.onerror = () => { loadedImages.add(item._path) }
    img.src = item.image
  })
}, { immediate: true })
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
    perspective: 1000px;
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
  }

  .service-image-gradient {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 70px;
    background: linear-gradient(transparent, rgba(10, 14, 26, 0.8));
    z-index: 1;
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

      a {
        color: inherit;
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: var(--accent);
        }
      }
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
        text-decoration: none;
        transition: all 0.3s ease;
        display: inline-block;
        text-align: center;
        box-sizing: border-box;

        &:hover { background: #d4b88a; transform: scale(1.02); }
      }
    }
  }
}
</style>
