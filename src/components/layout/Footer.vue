<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>{{ $t('footer.brand') }}</h3>
          <p>{{ $t('footer.description') }}</p>
          <div class="social-links">
            <a href="https://instagram.com" target="_blank" aria-label="Instagram" rel="noopener noreferrer"><i class="fab fa-instagram"></i></a>
            <a href="https://facebook.com" target="_blank" aria-label="Facebook" rel="noopener noreferrer"><i class="fab fa-facebook"></i></a>
            <a href="https://youtube.com" target="_blank" aria-label="YouTube" rel="noopener noreferrer"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <h4>{{ $t('footer.quick_links') }}</h4>
          <a href="#home" @click.prevent="scrollToSection('home')">{{ $t('nav.home') }}</a>
          <a href="#services" @click.prevent="scrollToSection('services')">{{ $t('nav.services') }}</a>
          <a href="#trips" @click.prevent="scrollToSection('trips')">{{ $t('nav.trips') }}</a>
          <a href="#contact" @click.prevent="scrollToSection('contact')">{{ $t('nav.contact') }}</a>
        </div>
        <div class="footer-contact">
          <h4>{{ $t('footer.contact_us') }}</h4>
          <p><a :href="`tel:${phone}`" class="contact-link"><i class="fas fa-phone"></i> {{ $t('footer.phone') }}</a></p>
          <p><a :href="mapUrl" target="_blank" rel="noopener noreferrer" class="contact-link"><i class="fas fa-map-marker-alt"></i> {{ $t('footer.location') }}</a></p>
          <p><a :href="`mailto:${email}`" class="contact-link"><i class="fas fa-envelope"></i> {{ email }}</a></p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 {{ $t('footer.brand') }} &mdash; {{ $t('footer.rights') }}</span>
        <div class="footer-legal">
          <a href="#" @click.prevent="showLegal = 'tos'">{{ $t('footer.terms') }}</a>
          <a href="#" @click.prevent="showLegal = 'privacy'">{{ $t('footer.privacy') }}</a>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="legal-modal">
        <div v-if="showLegal" class="legal-overlay" @click.self="showLegal = null">
          <div class="legal-modal glass-card">
            <button class="legal-close" @click="showLegal = null" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
            <h2>{{ showLegal === 'tos' ? $t('footer.terms') : $t('footer.privacy') }}</h2>
            <div class="legal-content">
              <p v-if="showLegal === 'tos'">{{ $t('footer.terms_body') }}</p>
              <p v-else>{{ $t('footer.privacy_body') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const showLegal = ref(null)

const phone = '+212615884469'
const mapUrl = 'https://www.google.com/maps?q=Agadir+80000+Morocco'

const email = computed(() => {
  return locale.value === 'fr' || locale.value === 'ar'
    ? 'info@bourmitrip.ma'
    : 'info@agadirberbereexperience.com'
})

function scrollToSection(id) {
  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped lang="scss">
.footer {
  margin-top: 5rem;
  padding: 4rem 0 2rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--glass-border);
  position: relative;
  z-index: 1;

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 4rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid var(--glass-border);
  }

  .footer-brand h3 {
    font-family: var(--font-heading);
    font-size: 2rem;
    color: var(--accent);
  }

  .footer-brand p {
    color: var(--text-secondary);
    margin: 1rem 0;
  }

  .social-links a {
    color: var(--text-secondary);
    margin-right: 1rem;
    font-size: 1.5rem;
    transition: color 0.3s ease;
    &:hover { color: var(--accent); }
  }

  .footer-links h4, .footer-contact h4 {
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.1em;
  }

  .footer-links a, .footer-contact p, .contact-link {
    display: block;
    color: var(--text-secondary);
    margin-bottom: 0.8rem;
    font-size: 0.95rem;
    transition: color 0.3s ease;
    text-decoration: none;
    &:hover { color: var(--text-primary); }
  }

  .footer-contact i {
    width: 1.5rem;
    color: var(--accent);
  }

  .footer-bottom {
    padding-top: 2rem;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;

    .footer-legal {
      display: flex;
      gap: 1.5rem;

      a {
        color: var(--text-secondary);
        font-size: 0.8rem;
        text-decoration: none;
        transition: color 0.3s ease;
        cursor: pointer;

        &:hover {
          color: var(--accent);
        }
      }
    }
  }

  @media (max-width: 768px) {
    .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
  }
}

.legal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 1rem;
}

.legal-modal {
  max-width: 560px;
  width: 100%;
  padding: 2.5rem;
  background: rgba(10, 14, 26, 0.95);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  position: relative;
  max-height: 80vh;
  overflow-y: auto;

  .legal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    font-size: 0.95rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: var(--accent);
    }
  }

  h2 {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--accent);
    margin-bottom: 1.5rem;
  }

  .legal-content {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.7;
  }
}

.legal-modal-enter-active,
.legal-modal-leave-active {
  transition: all 0.3s ease;

  .legal-modal {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
}

.legal-modal-enter-from,
.legal-modal-leave-to {
  opacity: 0;

  .legal-modal {
    transform: scale(0.92);
    opacity: 0;
  }
}

[dir="rtl"] {
  .legal-close {
    right: auto;
    left: 1rem;
  }
}
</style>
