<script setup lang="ts">
import ContentBookingCard from '~/components/content/BookingCard.vue'
import ContentComparisonTable from '~/components/content/ComparisonTable.vue'
import ContentMapEmbed from '~/components/content/MapEmbed.vue'

const route = useRoute()
const { locale } = useI18n()
import siteConfig from '~/data/siteConfig.json'
import {
  generateArticleSchema,
  extractFaqItems,
  generateFaqPageSchema,
  type ContentBody,
} from '~/composables/useJsonLd'

// Map MDC content components so they render server-side too
// (the content module only resolves these client-side by default)
const mdcComponents = {
  'booking-card': ContentBookingCard,
  'comparison-table': ContentComparisonTable,
  'map-embed': ContentMapEmbed,
}

const slug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? raw[0] : raw
})

const contentPath = computed(() => `/${locale.value}/blog/${slug.value}`)

const { data: article } = await useAsyncData(
  `article-${contentPath.value}`,
  () => queryContent(contentPath.value).findOne().catch(() => null)
)

const { data: recentArticles } = await useAsyncData(
  `recent-articles-${locale.value}-${contentPath.value}`,
  () => queryContent(`/${locale.value}/blog`)
    .where({ _path: { $ne: contentPath.value } })
    .sort({ date: -1 })
    .limit(3)
    .find()
)

useSeoMeta({
  title: () => article.value?.title ?? 'Article',
  description: () => article.value?.description ?? '',
  ogTitle: () => article.value?.title ?? 'Article',
  ogDescription: () => article.value?.description ?? '',
  ogImage: () => article.value?.image ?? '',
})

// Dynamic Article schema (SSR-safe, reactive, non-destructive)
const articleCanonicalUrl = computed(() => {
  const base: string = siteConfig.website ?? 'https://www.agadirberbereexperience.com'
  return `${base}/${locale.value}/blog/${slug.value}`
})

const articleSchema = computed(() => {
  if (!article.value) return null
  return generateArticleSchema({
    title: article.value.title as string | undefined,
    description: article.value.description as string | undefined,
    image: article.value.image as string | undefined,
    date: article.value.date as string | undefined,
    author: article.value.author as string | undefined,
    canonicalUrl: articleCanonicalUrl.value,
  })
})

// Auto-generated FAQPage schema whenever the markdown contains an FAQ section
const articleFaqSchema = computed(() => {
  const body = article.value?.body as ContentBody | null | undefined
  return generateFaqPageSchema(extractFaqItems(body))
})

useHead(() => {
  const scripts: { type: 'application/ld+json'; children: string }[] = []
  if (articleSchema.value != null) {
    scripts.push({
      type: 'application/ld+json',
      children: JSON.stringify(articleSchema.value),
    })
  }
  if (articleFaqSchema.value != null) {
    scripts.push({
      type: 'application/ld+json',
      children: JSON.stringify(articleFaqSchema.value),
    })
  }
  return { script: scripts }
})

const formatDate = (date: string): string => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  return d.toLocaleDateString(
    locale.value === 'ar' ? 'ar-MA' : locale.value === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  )
}
</script>

<template>
  <main v-if="article" class="article-page">
    <!-- Hero -->
    <section class="article-hero" :style="{ backgroundImage: `url(${article.image})` }">
      <div class="article-hero-overlay"></div>
      <div class="container article-hero-content">
        <NuxtLink :to="$localePath('/blog')" class="article-back">
          <i class="fas fa-arrow-left article-back-icon"></i>
          {{ $t('blog.eyebrow') }}
        </NuxtLink>

        <span class="article-badge">{{ $t('blog.eyebrow') }}</span>
        <h1 class="article-title">{{ article.title }}</h1>
        <p class="article-description">{{ article.description }}</p>

        <div class="article-meta">
          <span v-if="article.author" class="article-author">
            <i class="fas fa-user"></i>
            {{ article.author }}
          </span>
          <span v-if="article.date" class="article-date">
            <i class="far fa-calendar"></i>
            {{ formatDate(article.date) }}
          </span>
        </div>
      </div>
    </section>

    <!-- Body -->
    <section class="container article-body">
      <div class="article-layout">
        <aside v-if="article.body?.toc?.links?.length" class="article-toc glass-card">
          <h3>On this page</h3>
          <ul>
            <li v-for="link in article.body.toc.links" :key="link.id">
              <a :href="`#${link.id}`">{{ link.text }}</a>
            </li>
          </ul>
        </aside>

        <article class="article-content">
          <ContentRenderer :value="article" :components="mdcComponents" />
        </article>
      </div>
    </section>

    <!-- Recent Articles -->
    <section v-if="recentArticles?.length" class="recent-articles-section">
      <div class="container">
        <h3 class="recent-articles-title">{{ $t('blog.recent_articles') || 'Recent Articles' }}</h3>
        <div class="recent-articles-grid">
          <NuxtLink
            v-for="post in recentArticles"
            :key="post._path"
            :to="post._path"
            class="recent-article-card glass-card"
          >
            <div class="recent-article-image" :style="{ backgroundImage: `url(${post.image})` }"></div>
            <div class="recent-article-body">
              <span v-if="post.date" class="recent-article-date">{{ formatDate(post.date) }}</span>
              <h4>{{ post.title }}</h4>
              <p v-if="post.description" class="recent-article-description">{{ post.description }}</p>
              <span class="recent-article-more">
                {{ $t('blog.read_more') }}
                <i class="fas fa-arrow-right"></i>
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>

  <main v-else class="page-container container">
    <div class="glass-card mt-10 not-found">
      <h1>Article not found</h1>
      <NuxtLink :to="$localePath('/blog')" class="not-found-link">Back to Journal</NuxtLink>
    </div>
  </main>
</template>

<style scoped>
.article-page {
  padding-bottom: 5rem;
}

.article-hero {
  position: relative;
  min-height: 60vh;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding-top: 8rem;
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: 68vh;
    padding-top: 6rem;
  }
}

.article-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 14, 26, 0.97) 0%,
    rgba(10, 14, 26, 0.55) 55%,
    rgba(10, 14, 26, 0.4) 100%
  );
}

.article-hero-content {
  position: relative;
  z-index: 2;
  padding-bottom: 3.5rem;
}

.article-back {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: var(--accent);
  }
}

[dir="rtl"] .article-back-icon {
  transform: scaleX(-1);
}

.article-badge {
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

.article-title {
  font-family: var(--font-heading);
  font-size: clamp(2.2rem, 6vw, 4.2rem);
  font-weight: 300;
  line-height: 1.1;
  color: var(--text-primary);
  text-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
  margin-bottom: 1.2rem;
  max-width: 850px;
}

.article-description {
  color: var(--text-secondary);
  font-size: clamp(1rem, 1.8vw, 1.2rem);
  font-weight: 300;
  line-height: 1.7;
  max-width: 640px;
  margin-bottom: 1.75rem;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 300;

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  i {
    color: var(--accent);
    font-size: 0.85rem;
  }
}

.article-body {
  margin-top: -2.5rem;
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

.article-content,
.content-body {
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}

.article-content {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem 3.5rem;

  @media (max-width: 768px) {
    padding: 2rem 1.75rem;
  }

  :deep(p) {
    color: var(--text-secondary);
    font-size: 1.05rem;
    font-weight: 300;
    line-height: 1.9;
    margin-bottom: 1.5rem;
  }

  :deep(h2) {
    font-family: var(--font-heading);
    font-weight: 400;
    color: var(--text-primary);
    font-size: 1.9rem;
    margin: 2.5rem 0 1.25rem;
    scroll-margin-top: 6rem;
  }

  :deep(h3) {
    font-family: var(--font-heading);
    font-weight: 400;
    color: var(--text-primary);
    font-size: 1.4rem;
    margin: 2rem 0 1rem;
    scroll-margin-top: 6rem;
  }

  :deep(ul),
  :deep(ol) {
    color: var(--text-secondary);
    font-weight: 300;
    line-height: 1.9;
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
  }

  :deep(li) { margin-bottom: 0.5rem; }

  :deep(a) {
    color: var(--accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(blockquote) {
    border-left: 3px solid var(--accent);
    padding-left: 1.2rem;
    color: var(--text-primary);
    font-style: italic;
    font-size: 1.1rem;
    margin: 2rem 0;
  }

  :deep(img) {
    border-radius: 16px;
    margin: 2rem 0;
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin: 2.5rem 0;
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

.recent-articles-section {
  margin-top: 3rem;
  padding: 3rem 0 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  .recent-articles-title {
    font-family: var(--font-heading);
    font-weight: 400;
    font-size: 1.8rem;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .recent-articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1100px;
    margin: 0 auto;
  }

  .recent-article-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);

    &:hover {
      transform: translateY(-6px);
      border-color: var(--accent);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }

    .recent-article-image {
      height: 160px;
      background-size: cover;
      background-position: center;
      transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    }

    &:hover .recent-article-image {
      transform: scale(1.05);
    }

    .recent-article-body {
      padding: 1.25rem 1.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;

      .recent-article-date {
        font-size: 0.72rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h4 {
        font-family: var(--font-heading);
        font-size: 1.1rem;
        font-weight: 400;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
        line-height: 1.35;
      }

      .recent-article-description {
        color: var(--text-secondary);
        font-size: 0.88rem;
        font-weight: 300;
        line-height: 1.6;
        margin: 0 0 1rem;
      }

      .recent-article-more {
        margin-top: auto;
        color: var(--accent);
        font-size: 0.8rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
    }
  }
}
</style>
