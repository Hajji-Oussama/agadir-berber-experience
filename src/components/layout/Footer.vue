<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>{{ $t('footer.brand') }}</h3>
          <p>{{ $t('footer.description') }}</p>
          <div class="social-links">
            <a href="https://instagram.com" target="_blank" aria-label="Instagram" rel="noopener"><i class="fab fa-instagram"></i></a>
            <a href="https://facebook.com" target="_blank" aria-label="Facebook" rel="noopener"><i class="fab fa-facebook"></i></a>
            <a href="https://youtube.com" target="_blank" aria-label="YouTube" rel="noopener"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <h4>{{ $t('footer.quick_links') }}</h4>
          <router-link to="/">{{ $t('nav.home') }}</router-link>
          <router-link to="/services">{{ $t('nav.services') }}</router-link>
          <router-link to="/trips">{{ $t('nav.trips') }}</router-link>
          <router-link to="/contact">{{ $t('nav.contact') }}</router-link>
        </div>
        <div class="footer-contact">
          <h4>{{ $t('footer.contact_us') }}</h4>
          <p><i class="fas fa-phone"></i> {{ $t('footer.phone') }}</p>
          <p><i class="fas fa-map-marker-alt"></i> {{ $t('footer.location') }}</p>
          <p><i class="fas fa-envelope"></i> {{ $t('footer.email') }}</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 {{ $t('footer.brand') }} &mdash; {{ $t('footer.rights') }}</span>
      </div>
    </div>
  </footer>
</template>

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

  .footer-links a, .footer-contact p {
    display: block;
    color: var(--text-secondary);
    margin-bottom: 0.8rem;
    font-size: 0.95rem;
    transition: color 0.3s ease;
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
  }

  @media (max-width: 768px) {
    .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
  }
}
</style>
