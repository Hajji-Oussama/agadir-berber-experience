<template>
  <div class="page-container container">
    <h1 class="page-title" data-aos="fade-up">{{ $t('contact.title') }}</h1>
    <div class="contact-grid">
      <GlassCard data-aos="fade-right">
        <div class="contact-item">
          <i class="fas fa-phone"></i>
          <h3>{{ $t('contact.phone') }}</h3>
          <p>{{ $t('footer.phone') }}</p>
        </div>
        <div class="contact-item">
          <i class="fas fa-envelope"></i>
          <h3>{{ $t('contact.email') }}</h3>
          <p>{{ $t('footer.email') }}</p>
        </div>
        <div class="contact-item">
          <i class="fas fa-map-marker-alt"></i>
          <h3>{{ $t('contact.location') }}</h3>
          <p>{{ $t('footer.location') }}</p>
        </div>
      </GlassCard>
      <GlassCard data-aos="fade-left">
        <h3>{{ $t('contact.find_us') }}</h3>
        <div class="map-container">
          <iframe
            :src="siteConfig.map.embedUrl"
            width="100%"
            height="250"
            style="border:0; border-radius: 12px;"
            allowfullscreen=""
            loading="lazy"
            title="Google Maps"
          ></iframe>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup>
import GlassCard from '@/components/common/GlassCard.vue'
import siteConfig from '@/data/siteConfig.json'
</script>

<style scoped lang="scss">
.page-container {
  padding-top: 8rem;
  padding-bottom: 4rem;
  position: relative;
  z-index: 1;
}

.page-title {
  text-align: center;
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 300;
  margin-bottom: 3rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;

  .contact-item {
    margin-bottom: 2rem;

    i {
      font-size: 1.5rem;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    h3 {
      font-weight: 400;
      margin: 0.3rem 0;
      color: var(--accent);
      font-size: 1.1rem;
    }

    p {
      color: var(--text-secondary);
    }
  }

  .map-container {
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
