<template>
  <section class="contact-section section-padding section-anchor" id="contact">
    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <span class="eyebrow">{{ $t('contact.eyebrow') }}</span>
        <h2 class="section-title">{{ $t('contact.title') }}</h2>
        <p class="section-subtitle">{{ $t('contact.subtitle') }}</p>
      </div>
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27499.57323271208!2d-9.763014!3d30.432144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDI1JzU1LjciTiA5wrA0NSc0Ni44Ilc!5e0!3m2!1sen!2sma!4v1650000000000"
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
  </section>
</template>

<script setup>
import GlassCard from '@/components/common/GlassCard.vue'
</script>

<style scoped lang="scss">
.contact-section {
  position: relative;
  z-index: 1;

  .section-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 2.5rem;

    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.75rem;
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 300;
      color: var(--text-primary);
      margin-bottom: 0.75rem;
    }

    .section-subtitle {
      color: var(--text-secondary);
      font-size: clamp(0.95rem, 1.5vw, 1.1rem);
      font-weight: 300;
      line-height: 1.6;
    }
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
}
</style>
