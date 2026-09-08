<script setup lang="ts">
import ContentTrustBadges from '~/components/content/TrustBadges.vue'
import ContentComparisonTable from '~/components/content/ComparisonTable.vue'
import ContentGroupPromo from '~/components/content/GroupPromo.vue'
import ContentSocialEmbed from '~/components/content/SocialEmbed.vue'
import ContentShareButtons from '~/components/content/ShareButtons.vue'
import ContentBookingCard from '~/components/content/BookingCard.vue'
import ContentImageGallery from '~/components/content/ImageGallery.vue'
import ContentInfoAlert from '~/components/content/InfoAlert.vue'

const route = useRoute()
const { locale } = useI18n()
const { handleBooking } = useBooking()
const { formatPrice } = useCurrency()
import siteConfig from '~/data/siteConfig.json'
import { generateExperienceSchema } from '~/composables/useJsonLd'

// Map MDC content components so they render server-side too
// (the content module only resolves these client-side by default)
const mdcComponents = {
  'trust-badges': ContentTrustBadges,
  'comparison-table': ContentComparisonTable,
  'group-promo': ContentGroupPromo,
  'social-embed': ContentSocialEmbed,
  'share-buttons': ContentShareButtons,
  'booking-card': ContentBookingCard,
  'image-gallery': ContentImageGallery,
  'info-alert': ContentInfoAlert,
}

const slug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? raw[0] : raw
})

const contentPath = computed(() => `/${locale.value}/experiences/${slug.value}`)

const { data: experience } = await useAsyncData(
  `experience-${contentPath.value}`,
  () => queryContent(contentPath.value).findOne().catch(() => null)
)

const { data: otherExperiences } = await useAsyncData(
  `other-exp-${contentPath.value}`,
  () => queryContent(`/${locale.value}/experiences`)
    .where({ _path: { $ne: contentPath.value } })
    .limit(3)
    .find()
)

useSeoMeta({
  title: () => experience.value?.title ?? 'Experience',
  description: () => experience.value?.description ?? '',
  ogTitle: () => experience.value?.title ?? 'Experience',
  ogDescription: () => experience.value?.description ?? '',
  ogImage: () => experience.value?.image ?? '',
})

// Dynamic TouristTrip + Product schema (SSR-safe, reactive, non-destructive)
const experienceCanonicalUrl = computed(() => {
  const base: string = siteConfig.website ?? 'https://www.agadirberbereexperience.com'
  return `${base}/${locale.value}/experiences/${slug.value}`
})

const experienceSchema = computed(() => {
  if (!experience.value) return null
  return generateExperienceSchema({
    title: experience.value.title as string | undefined,
    description: experience.value.description as string | undefined,
    image: experience.value.image as string | undefined,
    price: experience.value.price as string | number | undefined,
    canonicalUrl: experienceCanonicalUrl.value,
  })
})

useHead(() => ({
  script:
    experienceSchema.value != null
      ? [
          {
            type: 'application/ld+json' as const,
            children: JSON.stringify(experienceSchema.value),
          },
        ]
      : [],
}))
</script>

<template>
  <main v-if="experience" class="experience-page">
    <!-- Hero -->
    <section class="experience-hero" :style="{ backgroundImage: `url(${experience.image})` }">
      <div class="experience-hero-overlay"></div>
      <div class="container experience-hero-content">
        <NuxtLink :to="$localePath('/#services')" class="experience-back">
          <i class="fas fa-arrow-left experience-back-icon"></i>
          {{ $t('nav.services') }}
        </NuxtLink>

        <div class="experience-badge" v-if="experience.category">{{ experience.category }}</div>
        <h1 class="experience-title">{{ experience.title }}</h1>
        <p class="experience-subtitle">{{ experience.description }}</p>

        <div class="experience-hero-meta">
          <span class="experience-price">{{ formatPrice(experience.price) }}</span>
          <span class="experience-duration"><i class="far fa-clock"></i> {{ experience.duration }}</span>
          <button type="button" class="experience-book" @click="handleBooking(experience)">
            <i class="fab fa-whatsapp"></i>
            Book Now via WhatsApp
          </button>
        </div>
      </div>
    </section>

    <!-- Body -->
    <section class="container experience-body">
      <div class="article-layout">
        <aside v-if="experience.body?.toc?.links?.length" class="article-toc glass-card">
          <h3>On this page</h3>
          <ul>
            <li v-for="link in experience.body.toc.links" :key="link.id">
              <a :href="`#${link.id}`">{{ link.text }}</a>
            </li>
          </ul>
        </aside>

        <article class="glass-card experience-content">
          <ContentRenderer :value="experience" :components="mdcComponents" />
        </article>
      </div>

      <div class="glass-card experience-cta">
        <div class="experience-cta-info">
          <h2>{{ experience.title }}</h2>
          <div class="experience-cta-meta">
            <span class="experience-price">{{ formatPrice(experience.price) }}</span>
            <span class="experience-duration"><i class="far fa-clock"></i> {{ experience.duration }}</span>
          </div>
        </div>
        <button type="button" class="experience-book" @click="handleBooking(experience)">
          <i class="fab fa-whatsapp"></i>
          Book Now via WhatsApp
        </button>
      </div>
    </section>

    <!-- Other Experiences -->
    <section v-if="otherExperiences?.length" class="other-experiences">
      <div class="container">
        <div class="other-header">
          <span class="eyebrow">{{ locale === 'ar' ? 'واصل الاستكشاف' : locale === 'fr' ? 'Continuez l\u2019Aventure' : 'Keep Exploring' }}</span>
          <h2>{{ locale === 'ar' ? 'تجارب أخرى' : locale === 'fr' ? 'Autres Expériences' : 'Other Adventures' }}</h2>
        </div>
        <div class="other-grid">
          <NuxtLink
            v-for="exp in otherExperiences"
            :key="exp._path"
            :to="exp._path"
            class="other-card glass-card"
          >
            <div class="other-card-image" :style="{ backgroundImage: `url(${cloudinaryImage(exp.image, 'w_600,c_limit')})` }"></div>
            <div class="other-card-body">
              <h3>{{ exp.title }}</h3>
              <div class="other-card-meta">
                <span class="other-price">{{ formatPrice(exp.price) }}</span>
                <span class="other-duration"><i class="far fa-clock"></i> {{ exp.duration }}</span>
              </div>
              <span class="other-card-link">
                {{ locale === 'ar' ? 'عرض التفاصيل' : locale === 'fr' ? 'Voir les détails' : 'View Details' }}
                <i class="fas fa-arrow-right other-card-arrow"></i>
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>

  <main v-else class="page-container container">
    <div class="glass-card mt-10 not-found">
      <h1>Experience not found</h1>
      <NuxtLink :to="$localePath('/')" class="not-found-link">Back to home</NuxtLink>
    </div>
  </main>
</template>

<style scoped>
.experience-page {
  padding-bottom: 4rem;
}

.experience-hero {
  position: relative;
  min-height: 72vh;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding-top: 8rem;
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: 80vh;
    padding-top: 6rem;
  }
}

.experience-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 14, 26, 0.95) 0%,
    rgba(10, 14, 26, 0.5) 50%,
    rgba(10, 14, 26, 0.4) 100%
  );
}

.experience-hero-content {
  position: relative;
  z-index: 2;
  padding-bottom: 4rem;

  @media (max-width: 768px) {
    padding-bottom: 3rem;
  }
}

.experience-back {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: var(--accent);
  }
}

[dir="rtl"] .experience-back-icon {
  transform: scaleX(-1);
}

.experience-badge {
  display: inline-block;
  padding: 0.35rem 1.2rem;
  border-radius: 60px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 1.2rem;
}

.experience-title {
  font-family: var(--font-heading);
  font-size: clamp(2.6rem, 8vw, 5.5rem);
  font-weight: 300;
  line-height: 1.05;
  color: var(--text-primary);
  text-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
  margin-bottom: 1.2rem;
  max-width: 900px;
}

.experience-subtitle {
  color: var(--text-secondary);
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 300;
  line-height: 1.7;
  max-width: 680px;
  margin-bottom: 2.5rem;
}

.experience-hero-meta {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.experience-price {
  font-family: var(--font-heading);
  font-size: 2.6rem;
  font-weight: 600;
  color: var(--accent);
  line-height: 1;
}

.experience-duration {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 300;

  i {
    color: var(--accent);
  }
}

.experience-book {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  padding: 1rem 2.2rem;
  min-height: 52px;
  border-radius: 60px;
  border: none;
  background: #25D366;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(37, 211, 102, 0.35);

  i {
    font-size: 1.25rem;
  }

  &:hover {
    background: #20bd5a;
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 15px 40px rgba(37, 211, 102, 0.5);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
}

.experience-body {
  margin-top: -2rem;
  position: relative;
  z-index: 3;
}

.article-layout {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 2rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.article-toc {
  position: sticky;
  top: 6rem;
  padding: 1.5rem;

  @media (max-width: 900px) {
    position: static;
  }

  h3 {
    font-family: var(--font-heading);
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  a {
    display: block;
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 300;
    line-height: 1.4;
    padding: 0.3rem 0.6rem;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.25s ease;

    &:hover {
      color: var(--accent);
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.experience-content {
  padding: 2.5rem 3rem;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    padding: 1.75rem;
  }

  :deep(p) {
    color: var(--text-secondary);
    font-size: 1.05rem;
    font-weight: 300;
    line-height: 1.8;
    margin-bottom: 1.25rem;
  }

  :deep(h2),
  :deep(h3) {
    font-family: var(--font-heading);
    font-weight: 400;
    color: var(--text-primary);
    margin: 2rem 0 1rem;
    scroll-margin-top: 6rem;
  }

  :deep(h2) { font-size: 1.8rem; }
  :deep(h3) { font-size: 1.4rem; }

  :deep(ul),
  :deep(ol) {
    color: var(--text-secondary);
    font-weight: 300;
    line-height: 1.8;
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;
  }

  :deep(li) { margin-bottom: 0.4rem; }

  :deep(a) {
    color: var(--accent);
    text-decoration: none;
  }

  :deep(blockquote) {
    border-left: 3px solid var(--accent);
    padding-left: 1.2rem;
    color: var(--text-secondary);
    font-style: italic;
    margin: 1.5rem 0;
  }

  :deep(img) {
    border-radius: 16px;
    margin: 1.5rem 0;
  }
}

.experience-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 2rem 2.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1.75rem;
  }

  .experience-cta-info {
    h2 {
      font-family: var(--font-heading);
      font-weight: 400;
      font-size: 1.4rem;
      color: var(--text-primary);
      margin-bottom: 0.75rem;
    }
  }

  .experience-cta-meta {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;

    .experience-price {
      font-size: 2rem;
    }
  }
}

.not-found {
  padding: 3rem;
  text-align: center;

  h1 {
    font-family: var(--font-heading);
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }

  .not-found-link {
    color: var(--accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.other-experiences {
  padding: 4rem 0 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  .other-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 3rem;

    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 1rem;
    }

    h2 {
      font-family: var(--font-heading);
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 300;
      color: var(--text-primary);
    }
  }

  .other-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1100px;
    margin: 0 auto;
  }

  .other-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);

    &:hover {
      transform: translateY(-8px);
      border-color: var(--accent);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

      .other-card-image {
        transform: scale(1.06);
      }

      .other-card-arrow {
        transform: translateX(4px);
      }
    }

    .other-card-image {
      height: 200px;
      background-size: cover;
      background-position: center;
      transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .other-card-body {
      padding: 1.5rem 1.75rem 1.75rem;
      display: flex;
      flex-direction: column;
      flex: 1;

      h3 {
        font-family: var(--font-heading);
        font-size: 1.3rem;
        font-weight: 400;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
      }

      .other-card-meta {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.25rem;

        .other-price {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--accent);
        }

        .other-duration {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 300;

          i {
            margin-right: 0.3rem;
            color: var(--accent);
          }
        }
      }

      .other-card-link {
        margin-top: auto;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--accent);
        font-size: 0.85rem;
        font-weight: 500;

        .other-card-arrow {
          transition: transform 0.3s ease;
        }
      }
    }
  }
}

[dir="rtl"] {
  .other-card .other-card-arrow {
    transform: scaleX(-1);
  }
}
</style>
