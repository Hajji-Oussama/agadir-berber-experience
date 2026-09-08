<script setup lang="ts">
import siteConfig from '~/data/siteConfig.json'

const { locale } = useI18n()

const { data: articles } = await useAsyncData(
  `blog-${locale.value}`,
  () => queryContent(`/${locale.value}/blog`).find()
)

// Localized SEO meta (SSR-safe, reactive) — eliminates "Untitled" snippets.
// Note: <link rel="canonical"> is already emitted globally via useLocaleHead()
// in app.vue, so only ogUrl is set here to avoid duplicate canonical tags.
const blogSeo = computed(() => {
  if (locale.value === 'fr') {
    return {
      title: "Guide de Voyage Agadir & Conseils d'Initiés",
      description:
        'Conseils honnêtes, tarifs des excursions et savoir local pour Agadir, Taghazout et Kasbat Souss par des guides locaux.',
    }
  }
  if (locale.value === 'ar') {
    return {
      title: 'دليل السفر إلى أكادير ونصائح محلية',
      description:
        'إرشادات صادقة، أسعار الجولات السياحية، وأسرار الاستكشاف في أكادير وتغازوت وقصبة سوس من مرشدين محليين.',
    }
  }
  return {
    title: 'Agadir Travel Guide & Insider Tips',
    description:
      'Honest travel advice, excursion prices, and local insights for Agadir, Taghazout, and Kasbat Souss from local guides.',
  }
})

const blogCanonicalUrl = computed(() => {
  const base: string = siteConfig.website ?? 'https://www.agadirberbereexperience.com'
  return `${base}/${locale.value}/blog`
})

useSeoMeta({
  title: () => blogSeo.value.title,
  description: () => blogSeo.value.description,
  ogTitle: () => blogSeo.value.title,
  ogDescription: () => blogSeo.value.description,
  ogType: 'website',
  ogUrl: () => blogCanonicalUrl.value,
})
</script>

<template>
  <main class="blog-index">
    <div class="container">
      <div class="blog-index-header">
        <span class="eyebrow">{{ $t('blog.eyebrow') }}</span>
        <h1>{{ $t('blog.title') }}</h1>
        <p>{{ $t('blog.subtitle') }}</p>
      </div>

      <div v-if="articles?.length" class="blog-grid">
        <NuxtLink
          v-for="article in articles"
          :key="article._path"
          :to="article._path"
          class="blog-card glass-card"
        >
          <div class="blog-card-image" :style="{ backgroundImage: `url(${article.image})` }"></div>
          <div class="blog-card-body">
            <h2>{{ article.title }}</h2>
            <p>{{ article.description }}</p>
            <span class="blog-card-more">
              {{ $t('blog.read_more') }}
              <i class="fas fa-arrow-right blog-card-arrow"></i>
            </span>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="blog-empty glass-card">
        <p>{{ $t('blog.empty') }}</p>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.blog-index {
  padding-top: 8rem;
  padding-bottom: 5rem;
  min-height: 70vh;

  .blog-index-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 3.5rem;

    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 1rem;
    }

    h1 {
      font-family: var(--font-heading);
      font-size: clamp(2.2rem, 5vw, 3.5rem);
      font-weight: 300;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    p {
      color: var(--text-secondary);
      font-size: 1.1rem;
      font-weight: 300;
      line-height: 1.6;
    }
  }

  .blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
    max-width: 1100px;
    margin: 0 auto;
  }

  .blog-card {
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

      .blog-card-image {
        transform: scale(1.06);
      }

      .blog-card-arrow {
        transform: translateX(4px);
      }
    }

    .blog-card-image {
      height: 200px;
      background-size: cover;
      background-position: center;
      transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .blog-card-body {
      padding: 1.5rem 1.75rem 1.75rem;
      display: flex;
      flex-direction: column;
      flex: 1;

      h2 {
        font-family: var(--font-heading);
        font-size: 1.35rem;
        font-weight: 400;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
        line-height: 1.3;
      }

      p {
        color: var(--text-secondary);
        font-size: 0.92rem;
        font-weight: 300;
        line-height: 1.6;
        margin-bottom: 1.25rem;
        flex: 1;
      }

      .blog-card-more {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--accent);
        font-size: 0.85rem;
        font-weight: 500;
        letter-spacing: 0.05em;

        .blog-card-arrow {
          transition: transform 0.3s ease;
        }
      }
    }
  }

  .blog-empty {
    padding: 3rem;
    text-align: center;
    color: var(--text-secondary);
    font-weight: 300;
  }
}

[dir="rtl"] {
  .blog-card {
    .blog-card-arrow {
      transform: scaleX(-1);
    }

    &:hover .blog-card-arrow {
      transform: scaleX(-1) translateX(4px);
    }
  }
}
</style>
