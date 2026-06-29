<template>
  <header class="header glass-nav" :class="{ scrolled: isScrolled }" ref="headerRef">
    <div class="container header-inner">
      <router-link to="/" class="logo" @click="scrollToTop">
        <span class="logo-full">Agadir <span>Berbère</span></span>
        <span class="logo-short">A.B.E</span>
      </router-link>

      <nav class="nav-links">
        <a
          href="#home"
          @click.prevent="scrollToSection('home')"
          :class="{ active: activeSection === 'home' && route.path === '/' }"
        >
          {{ $t('nav.home') }}
        </a>
        <a
          href="#services"
          @click.prevent="scrollToSection('services')"
          :class="{ active: activeSection === 'services' }"
        >
          {{ $t('nav.services') }}
        </a>
        <a
          href="#trips"
          @click.prevent="scrollToSection('trips')"
          :class="{ active: activeSection === 'trips' }"
        >
          {{ $t('nav.trips') }}
        </a>
        <router-link to="/contact" active-class="active">
          {{ $t('nav.contact') }}
        </router-link>
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
          <a href="#home" @click.prevent="scrollToSection('home')">
            {{ $t('nav.home') }}
          </a>
          <a href="#services" @click.prevent="scrollToSection('services')">
            {{ $t('nav.services') }}
          </a>
          <a href="#trips" @click.prevent="scrollToSection('trips')">
            {{ $t('nav.trips') }}
          </a>
          <router-link to="/contact" @click="mobileOpen = false">
            {{ $t('nav.contact') }}
          </router-link>
          <div class="mobile-lang">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

const route = useRoute()
const headerRef = ref(null)
const isScrolled = ref(false)
const mobileOpen = ref(false)
const activeSection = ref('home')

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
  updateActiveSection()
}

const updateActiveSection = () => {
  const sections = ['home', 'services', 'trips']
  const scrollPosition = window.scrollY + 150

  if (route.path === '/contact') {
    activeSection.value = 'contact'
    return
  }

  for (const section of sections) {
    const el = document.getElementById(section)
    if (el) {
      const top = el.offsetTop
      const bottom = top + el.offsetHeight
      if (scrollPosition >= top && scrollPosition < bottom) {
        activeSection.value = section
        return
      }
    }
  }

  if (window.scrollY < 100) {
    activeSection.value = 'home'
  }
}

const scrollToSection = (id) => {
  mobileOpen.value = false

  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  setTimeout(() => {
    const el = document.getElementById(id)
    if (el) {
      const headerHeight = headerRef.value ? headerRef.value.offsetHeight : 80
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerHeight - 20

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }, 300)
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleMobileMenu = () => {
  mobileOpen.value = !mobileOpen.value
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && mobileOpen.value) {
    mobileOpen.value = false
  }
}

const handleResize = () => {
  if (window.innerWidth > 768 && mobileOpen.value) {
    mobileOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)

  setTimeout(updateActiveSection, 100)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
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

    .logo {
      font-size: clamp(0.9rem, 2.5vw, 1.2rem);
    }
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .logo {
    font-family: var(--font-heading);
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    font-weight: 400;
    letter-spacing: 0.1em;
    color: var(--text-primary);
    text-decoration: none;
    white-space: nowrap;
    transition: font-size 0.3s ease;

    span {
      color: var(--accent);
    }

    .logo-short {
      display: none;
    }

    @media (max-width: 500px) {
      font-size: 0.9rem;
      letter-spacing: 0.05em;

      .logo-full {
        display: none;
      }
      .logo-short {
        display: inline;
        font-weight: 600;
        letter-spacing: 0.15em;
      }
    }

    @media (max-width: 400px) {
      font-size: 0.8rem;
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
      cursor: pointer;
      text-decoration: none;

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

      &:hover,
      &.active {
        color: var(--text-primary);
        &::after {
          width: 100%;
        }
      }
    }

    @media (max-width: 900px) {
      gap: 1.5rem;
      a {
        font-size: 0.75rem;
      }
    }

    @media (max-width: 768px) {
      display: none;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
      display: none;
    }
  }

  .mobile-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.3rem;
    z-index: 10;

    span {
      width: 25px;
      height: 2px;
      background: var(--text-primary);
      transition: 0.3s ease;
      display: block;
      border-radius: 2px;
    }

    @media (max-width: 768px) {
      display: flex;
    }

    &:hover span {
      background: var(--accent);
    }
  }

  .mobile-menu-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .mobile-menu {
    position: absolute;
    top: calc(100% + 1rem);
    right: 1rem;
    left: 1rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    background: rgba(10, 14, 26, 0.95);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);

    a,
    .router-link {
      color: var(--text-primary);
      font-size: 1.2rem;
      padding: 0.6rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      text-decoration: none;
      transition: color 0.3s ease;
      cursor: pointer;

      &:hover {
        color: var(--accent);
      }

      &.active {
        color: var(--accent);
      }
    }

    .mobile-lang {
      margin-top: 0.5rem;
      display: flex;
      justify-content: center;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;

  .mobile-menu {
    transform: translateY(-20px) scale(0.95);
  }
}

.slide-enter-to,
.slide-leave-from {
  .mobile-menu {
    transform: translateY(0) scale(1);
  }
}
</style>
