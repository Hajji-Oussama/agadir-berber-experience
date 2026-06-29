<template>
  <header class="header glass-nav" :class="{ scrolled: isScrolled }">
    <div class="container header-inner">
      <router-link to="/" class="logo">
        BOURMI <span>Trip</span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/" active-class="active" :class="{ exact: $route.path === '/' }">{{ $t('nav.home') }}</router-link>
        <router-link to="/services" active-class="active">{{ $t('nav.services') }}</router-link>
        <router-link to="/trips" active-class="active">{{ $t('nav.trips') }}</router-link>
        <router-link to="/contact" active-class="active">{{ $t('nav.contact') }}</router-link>
      </nav>

      <div class="header-actions">
        <LanguageSwitcher />
      </div>

      <button class="mobile-toggle" @click="toggleMobileMenu" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <Transition name="slide">
      <div v-if="mobileOpen" class="mobile-menu-overlay" @click="mobileOpen = false">
        <div class="mobile-menu glass-card" @click.stop>
          <a href="#" @click.prevent="scrollToSection('hero')">{{ $t('nav.home') }}</a>
          <a href="#services" @click.prevent="scrollToSection('services')">{{ $t('nav.services') }}</a>
          <a href="#trips" @click.prevent="scrollToSection('trips')">{{ $t('nav.trips') }}</a>
          <a href="#contact" @click.prevent="scrollToSection('contact')">{{ $t('nav.contact') }}</a>
          <div class="mobile-lang">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

const isScrolled = ref(false)
const mobileOpen = ref(false)

const toggleMobileMenu = () => {
  mobileOpen.value = !mobileOpen.value
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const scrollToSection = (id) => {
  mobileOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.header {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(95%, 1200px);
  padding: 0.8rem 2rem;
  border-radius: 80px;
  transition: all 0.4s ease;
  z-index: 999;
  background: rgba(10, 14, 26, 0.4);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

  &.scrolled {
    top: 0.5rem;
    padding: 0.5rem 1.5rem;
    background: rgba(10, 14, 26, 0.85);
    backdrop-filter: blur(30px) saturate(200%);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  .logo {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    color: var(--text-primary);
    white-space: nowrap;
    span {
      color: var(--accent);
    }
  }

  .nav-links {
    display: flex;
    gap: 2.5rem;
    a {
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 400;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      position: relative;
      transition: color 0.3s ease;
      padding: 0.5rem 0;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: var(--accent);
        transition: width 0.3s ease;
      }

      &:hover, &.active {
        color: var(--text-primary);
        &::after { width: 100%; }
      }
    }
  }

  .mobile-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    span {
      width: 25px;
      height: 2px;
      background: var(--text-primary);
      transition: 0.3s ease;
      display: block;
    }
  }

  .mobile-menu-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }

  .mobile-menu {
    position: absolute;
    top: 4.5rem;
    right: 1rem;
    left: 1rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: rgba(10, 14, 26, 0.95);
    backdrop-filter: blur(40px);
    a {
      color: var(--text-primary);
      font-size: 1.2rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .mobile-lang {
      margin-top: 0.5rem;
      display: flex;
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .nav-links { display: none; }
    .mobile-toggle { display: flex; }
    .header-actions { display: none; }
  }
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  .mobile-menu {
    transform: translateY(-20px) scale(0.95);
  }
}
</style>
