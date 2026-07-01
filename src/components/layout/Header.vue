<template>
  <header class="header glass-nav" :class="{ scrolled: isScrolled }" ref="headerRef">
    <div class="container header-inner">
      

        <router-link to="/" class="logo" @click="scrollToTop">
        <img src="https://res.cloudinary.com/nczftcee/image/upload/v1782908638/Design_sans_titre_1_1_b82llb.png" alt="Agadir Berbere Experience" class="logo-image" />
        <span class="logo-text">Agadir <span>Berbère</span></span>
      </router-link>
     

      <nav class="nav-links">
        <a
          href="#home"
          @click.prevent="scrollToSection('home')"
          :class="{ active: activeSection === 'home' && route.path === '/' }"
        >
          {{ $t('nav.home') }}
        </a>

        <div
          class="nav-dropdown"
          @mouseenter="openDropdown('services')"
          @mouseleave="closeDropdown('services')"
        >
          <a
            href="#services"
            @click.prevent="toggleDropdown('services')"
            :class="{ active: activeSection === 'services' }"
          >
            {{ $t('nav.services') }}
            <i class="fas fa-chevron-down dropdown-chevron"></i>
          </a>
          <Transition name="mega">
            <div v-if="activeDropdown === 'services'" class="mega-menu glass-card">
              <div class="mega-grid">
                <div
                  v-for="item in servicesData"
                  :key="item.id"
                  class="mega-item"
                  @click.prevent="scrollToCard('services', item.id)"
                  role="button"
                  tabindex="0"
                  @keydown.enter="scrollToCard('services', item.id)"
                >
                  <div class="mega-thumb">
                    <img :src="item.image" :alt="item.name" loading="lazy" />
                  </div>
                  <div class="mega-info">
                    <span class="mega-name">{{ item.name }}</span>
                    <span class="mega-price">{{ item.price }} Dhs</span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div
          class="nav-dropdown"
          @mouseenter="openDropdown('trips')"
          @mouseleave="closeDropdown('trips')"
        >
          <a
            href="#trips"
            @click.prevent="toggleDropdown('trips')"
            :class="{ active: activeSection === 'trips' }"
          >
            {{ $t('nav.trips') }}
            <i class="fas fa-chevron-down dropdown-chevron"></i>
          </a>
          <Transition name="mega">
            <div v-if="activeDropdown === 'trips'" class="mega-menu glass-card">
              <div class="mega-grid">
                <div
                  v-for="item in tripsData"
                  :key="item.id"
                  class="mega-item"
                  @click.prevent="scrollToCard('trips', item.id)"
                  role="button"
                  tabindex="0"
                  @keydown.enter="scrollToCard('trips', item.id)"
                >
                  <div class="mega-thumb">
                    <img :src="item.image" :alt="item.name" loading="lazy" />
                  </div>
                  <div class="mega-info">
                    <span class="mega-name">{{ item.name }}</span>
                    <span class="mega-price">{{ item.price }} Dhs</span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <a
          href="#contact"
          @click.prevent="scrollToSection('contact')"
          :class="{ active: activeSection === 'contact' }"
        >
          {{ $t('nav.contact') }}
        </a>
      </nav>

      <div class="header-actions">
        <LanguageSwitcher />
      </div>

      <button class="mobile-toggle" @click="toggleMobileMenu" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <Transition name="slide">
      <div v-if="mobileOpen" class="mobile-menu-overlay" @click="closeMobileMenuFn">
        <div class="mobile-menu glass-card" @click.stop>
          <a href="#home" @click.prevent="scrollToSection('home')">
            {{ $t('nav.home') }}
          </a>

          <div class="mobile-dropdown">
            <button class="mobile-dropdown-trigger" @click="toggleMobileDropdown('services')">
              {{ $t('nav.services') }}
              <i class="fas fa-chevron-down" :class="{ rotated: mobileDropdown === 'services' }"></i>
            </button>
            <Transition name="accordion">
              <div v-if="mobileDropdown === 'services'" class="mobile-dropdown-content">
                <a
                  v-for="item in servicesData"
                  :key="item.id"
                  href="#services"
                  @click.prevent="scrollToCard('services', item.id)"
                >
                  {{ item.name }}
                  <span class="mobile-dropdown-price">{{ item.price }} Dhs</span>
                </a>
              </div>
            </Transition>
          </div>

          <div class="mobile-dropdown">
            <button class="mobile-dropdown-trigger" @click="toggleMobileDropdown('trips')">
              {{ $t('nav.trips') }}
              <i class="fas fa-chevron-down" :class="{ rotated: mobileDropdown === 'trips' }"></i>
            </button>
            <Transition name="accordion">
              <div v-if="mobileDropdown === 'trips'" class="mobile-dropdown-content">
                <a
                  v-for="item in tripsData"
                  :key="item.id"
                  href="#trips"
                  @click.prevent="scrollToCard('trips', item.id)"
                >
                  {{ item.name }}
                  <span class="mobile-dropdown-price">{{ item.price }} Dhs</span>
                </a>
              </div>
            </Transition>
          </div>

          <a href="#contact" @click.prevent="scrollToSection('contact')">
            {{ $t('nav.contact') }}
          </a>

          <button class="mobile-whatsapp" @click="handleBooking()">
            <i class="fab fa-whatsapp"></i>
            Book Now via WhatsApp
          </button>

          <div class="mobile-lang">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { pushGuard, popGuard } from '@/composables/useBackGuard'
import { fetchServices, fetchTrips } from '@/services/api'
import { useBooking } from '@/composables/useBooking'

const route = useRoute()
const { locale } = useI18n()
const { handleBooking } = useBooking()

const headerRef = ref(null)
const isScrolled = ref(false)
const mobileOpen = ref(false)
const mobileDropdown = ref(null)
const activeSection = ref('home')
const activeDropdown = ref(null)
const servicesData = ref([])
const tripsData = ref([])

let dropdownTimers = {}

async function loadNavData(localeCode) {
  const [svc, trp] = await Promise.all([
    fetchServices(localeCode),
    fetchTrips(localeCode)
  ])
  servicesData.value = svc.services || []
  tripsData.value = trp.trips || []
}

watch(locale, (newLocale) => {
  loadNavData(newLocale)
}, { immediate: true })

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
  updateActiveSection()
}

const updateActiveSection = () => {
  const sections = ['home', 'services', 'trips', 'contact']
  const scrollPosition = window.scrollY + 150

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

const closeMobileMenuFn = () => {
  mobileOpen.value = false
  popGuard(closeMobileMenuFn)
}

const scrollToSection = (id) => {
  mobileOpen.value = false
  popGuard(closeMobileMenuFn)
  activeDropdown.value = null

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

const scrollToCard = (sectionId, cardId) => {
  activeDropdown.value = null
  mobileOpen.value = false
  mobileDropdown.value = null
  popGuard(closeMobileMenuFn)

  const scrollToCardInner = () => {
    const selector = `[data-id="${cardId}"]`
    const card = document.querySelector(selector)
    if (card) {
      const headerHeight = headerRef.value ? headerRef.value.offsetHeight : 80
      const elementPosition = card.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerHeight - 30

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      card.classList.add('card-highlight')
      setTimeout(() => card.classList.remove('card-highlight'), 1500)
      return
    }

    const section = document.getElementById(sectionId)
    if (section) {
      const headerHeight = headerRef.value ? headerRef.value.offsetHeight : 80
      const elementPosition = section.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerHeight - 20

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      setTimeout(() => scrollToCardInner(), 600)
    }
  }

  scrollToCardInner()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleMobileDropdown = (name) => {
  mobileDropdown.value = mobileDropdown.value === name ? null : name
}

const toggleMobileMenu = () => {
  mobileOpen.value = !mobileOpen.value
  if (mobileOpen.value) {
    pushGuard(closeMobileMenuFn)
  } else {
    popGuard(closeMobileMenuFn)
  }
}

const openDropdown = (name) => {
  if (dropdownTimers[name]) clearTimeout(dropdownTimers[name])
  dropdownTimers[name] = setTimeout(() => {
    activeDropdown.value = name
  }, 150)
}

const closeDropdown = (name) => {
  if (dropdownTimers[name]) clearTimeout(dropdownTimers[name])
  dropdownTimers[name] = setTimeout(() => {
    if (activeDropdown.value === name) {
      activeDropdown.value = null
    }
  }, 200)
}

const toggleDropdown = (name) => {
  if (activeDropdown.value === name) {
    activeDropdown.value = null
  } else {
    Object.values(dropdownTimers).forEach(clearTimeout)
    activeDropdown.value = name
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && mobileOpen.value) {
    mobileOpen.value = false
    popGuard(closeMobileMenuFn)
  }
  if (e.key === 'Escape' && activeDropdown.value) {
    activeDropdown.value = null
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
  Object.values(dropdownTimers).forEach(clearTimeout)
})
</script>

<style scoped lang="scss">
.header {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(95%, 1200px);
  max-width: 100%;
  padding: 0.8rem 2rem;
  border-radius: 80px;
  transition: all 0.4s ease;
  z-index: 999;
  background: rgba(10, 14, 26, 0.4);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;

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
    width: 100%;
    overflow: hidden;
  }

 
  .nav-links {
    display: flex;
    gap: 1.2rem;
    align-items: center;

    > a, .nav-dropdown > a {
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
      display: flex;
      align-items: center;
      gap: 0.3rem;

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

    .dropdown-chevron {
      font-size: 0.6rem;
      transition: transform 0.3s ease;
    }

    @media (max-width: 900px) {
      gap: 0.8rem;
      > a, .nav-dropdown > a {
        font-size: 0.7rem;
      }
    }

    @media (max-width: 768px) {
      display: none;
    }
  }

  .nav-dropdown {
    position: relative;

    &:hover .dropdown-chevron {
      transform: rotate(180deg);
    }
  }

  .mega-menu {
    position: absolute;
    top: calc(100% + 0.8rem);
    left: 50%;
    transform: translateX(-50%);
    min-width: 360px;
    padding: 1.2rem;
    background: rgba(10, 14, 26, 0.96);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

    &::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 12px;
      background: rgba(10, 14, 26, 0.96);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      rotate: 45deg;
    }
  }

  .mega-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }

  .mega-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.1);
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  }

  .mega-thumb {
    width: 52px;
    height: 52px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.04);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .mega-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .mega-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mega-price {
    font-size: 0.72rem;
    color: var(--accent);
    font-weight: 400;
    font-family: var(--font-heading);
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
    z-index: 0;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .mobile-menu {
    position: absolute;
    top: calc(100% + 1rem);
    right: 1rem;
    left: 1rem;
    z-index: 1;
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

    .mobile-whatsapp {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      margin-top: 0.5rem;
      padding: 1rem;
      background: #25D366;
      color: #fff;
      border-radius: 60px;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      letter-spacing: 0.02em;
      transition: all 0.3s ease;
      text-decoration: none;

      i {
        font-size: 1.3rem;
      }

      &:hover {
        background: #20bd5a;
        transform: scale(1.02);
        box-shadow: 0 8px 30px rgba(37, 211, 102, 0.4);
      }

      &:active {
        transform: scale(0.98);
      }
    }

    .mobile-dropdown {
      .mobile-dropdown-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        background: transparent;
        border: none;
        color: var(--text-primary);
        font-size: 1.2rem;
        padding: 0.6rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: color 0.3s ease;
        font-family: inherit;

        i {
          font-size: 0.9rem;
          transition: transform 0.3s ease;
          color: var(--text-secondary);

          &.rotated {
            transform: rotate(180deg);
          }
        }

        &:hover {
          color: var(--accent);
        }
      }

      .mobile-dropdown-content {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0.3rem 0 0.3rem 1rem;

        a {
          font-size: 0.95rem;
          padding: 0.4rem 0;
          border-bottom: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      }

      .mobile-dropdown-price {
        font-size: 0.8rem;
        color: var(--accent);
        font-family: var(--font-heading);
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

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 400px;
}

.mega-enter-active,
.mega-leave-active {
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.mega-enter-from,
.mega-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px) scale(0.96);
}

.mega-enter-to,
.mega-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
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

@media (max-width: 500px) {
  .header .logo .logo-svg {
    display: block;
  }
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }

    .logo-image {
      height: 42px;
      width: auto;
      object-fit: contain;
      flex-shrink: 0; /* يمنع انكماش الصورة وخروجها عن السيطرة */
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2));
    }

    .logo-text {
      font-family: var(--font-heading);
      font-size: clamp(1.1rem, 2vw, 1.4rem);
      font-weight: 400;
      letter-spacing: 0.05em;
      color: var(--text-primary);
      white-space: nowrap;

      span {
        color: var(--accent);
      }
    }

    /* التجاوب مع شاشات التابلت */
    @media (max-width: 768px) {
      .logo-image { height: 36px; }
      .logo-text { font-size: 1.1rem; }
    }

    /* التجاوب مع شاشات الهاتف الصغيرة */
    @media (max-width: 480px) {
      gap: 0.4rem;
      .logo-image { height: 30px; }
      .logo-text { font-size: 0.95rem; }
    }
  }
</style>
