<template>
  <header class="app-header" :class="{ scrolled: isScrolled }" ref="headerRef">
    <div class="container header-inner">
      <NuxtLink :to="$localePath('/')" class="logo">
        <img
          src="https://res.cloudinary.com/nczftcee/image/upload/v1782908638/Design_sans_titre_1_1_b82llb.png"
          alt="Agadir Berbere Experience"
          class="logo-image"
        />
        <span class="logo-text">Agadir <span>Berbère</span></span>
      </NuxtLink>

      <nav class="nav-links">
        <NuxtLink :to="$localePath('/')">{{ $t('nav.home') }}</NuxtLink>

        <div class="nav-dropdown" @mouseenter="openDropdown('services')" @mouseleave="closeDropdown('services')">
          <a
            href="#services"
            class="nav-dropdown-link"
            @click.prevent="toggleDropdown('services')"
            :class="{ active: activeDropdown === 'services' }"
          >
            {{ $t('nav.services') }}
            <i class="fas fa-chevron-down dropdown-chevron"></i>
          </a>
          <Transition name="mega">
            <div v-show="activeDropdown === 'services'" class="mega-menu glass-card">
              <div class="mega-grid">
                <NuxtLink
                  v-for="item in experiences"
                  :key="item._path"
                  :to="item._path"
                  class="mega-item"
                >
                  <div class="mega-thumb">
                    <img :src="item.image" :alt="item.title" loading="lazy" decoding="async" />
                  </div>
                  <div class="mega-info">
                    <span class="mega-name">{{ item.title }}</span>
                    <span class="mega-price">{{ formatPrice(item.price) }}</span>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>

        <div class="nav-dropdown desktop-hidden" @mouseenter="openDropdown('trips')" @mouseleave="closeDropdown('trips')">
          <a
            href="#trips"
            class="nav-dropdown-link"
            @click.prevent="toggleDropdown('trips')"
            :class="{ active: activeDropdown === 'trips' }"
          >
            {{ $t('nav.trips') }}
            <i class="fas fa-chevron-down dropdown-chevron"></i>
          </a>
          <Transition name="mega">
            <div v-show="activeDropdown === 'trips'" class="mega-menu glass-card">
              <div class="mega-grid">
                <NuxtLink
                  v-for="item in trips"
                  :key="item.id"
                  :to="$localePath('/#trips')"
                  class="mega-item"
                >
                  <div class="mega-thumb">
                    <img :src="item.image" :alt="item.name" loading="lazy" decoding="async" />
                  </div>
                  <div class="mega-info">
                    <span class="mega-name">{{ item.name }}</span>
                    <span class="mega-price">{{ formatPrice(item.price) }}</span>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>

        <NuxtLink :to="$localePath('/blog')">{{ $t('nav.blog') }}</NuxtLink>

        <NuxtLink :to="$localePath('/#contact')">{{ $t('nav.contact') }}</NuxtLink>
      </nav>

      <div class="header-actions">
        <CommonCurrencySwitcher />
        <span class="header-divider"></span>
        <div class="lang-switcher" aria-label="Language switcher">
          <NuxtLink
            v-for="lang in locales"
            :key="lang.code"
            :to="switchLocalePath(lang.code)"
            class="lang-btn"
            :class="{ active: locale === lang.code }"
            :aria-label="lang.name"
          >
            {{ lang.flag }}
          </NuxtLink>
        </div>
      </div>

      <button class="mobile-toggle" @click="toggleMobileMenu" :aria-expanded="mobileOpen" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <Transition name="slide">
      <div v-if="mobileOpen" class="mobile-menu-overlay" @click="mobileOpen = false">
        <div class="mobile-menu glass-card" @click.stop>
          <NuxtLink :to="$localePath('/')" @click="mobileOpen = false">{{ $t('nav.home') }}</NuxtLink>
          <NuxtLink :to="$localePath('/#services')" @click="mobileOpen = false">{{ $t('nav.services') }}</NuxtLink>
          <NuxtLink :to="$localePath('/#trips')" @click="mobileOpen = false">{{ $t('nav.trips') }}</NuxtLink>
          <NuxtLink :to="$localePath('/blog')" @click="mobileOpen = false">{{ $t('nav.blog') }}</NuxtLink>
          <NuxtLink :to="$localePath('/#contact')" @click="mobileOpen = false">{{ $t('nav.contact') }}</NuxtLink>

          <div class="mobile-currency-section">
            <CommonCurrencySwitcher />
          </div>

          <button class="mobile-whatsapp" @click="handleBooking()">
            <i class="fab fa-whatsapp"></i>
            Book Now via WhatsApp
          </button>

          <div class="mobile-lang">
            <NuxtLink
              v-for="lang in locales"
              :key="lang.code"
              :to="switchLocalePath(lang.code)"
              class="lang-btn"
              :class="{ active: locale === lang.code }"
              :aria-label="lang.name"
            >
              {{ lang.flag }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import tripsEN from '~/data/trips/en.json'
import tripsFR from '~/data/trips/fr.json'
import tripsAR from '~/data/trips/ar.json'

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { handleBooking } = useBooking()
const { formatPrice } = useCurrency()

const isScrolled = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const mobileOpen = ref(false)
const activeDropdown = ref<string | null>(null)
const dropdownTimers: Record<string, ReturnType<typeof setTimeout> | null> = {}

const { data: experiences } = await useAsyncData(
  `mega-services-${locale.value}`,
  () => queryContent(`/${locale.value}/experiences`).find()
)

const trips = computed(() =>
  locale.value === 'fr' ? tripsFR.trips : locale.value === 'ar' ? tripsAR.trips : tripsEN.trips
)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMobileMenu = () => {
  mobileOpen.value = !mobileOpen.value
}

const handleResize = () => {
  if (window.innerWidth > 768 && mobileOpen.value) {
    mobileOpen.value = false
  }
}

const openDropdown = (name: string) => {
  if (dropdownTimers[name]) clearTimeout(dropdownTimers[name])
  dropdownTimers[name] = setTimeout(() => {
    activeDropdown.value = name
  }, 150)
}

const closeDropdown = (name: string) => {
  if (dropdownTimers[name]) clearTimeout(dropdownTimers[name])
  dropdownTimers[name] = setTimeout(() => {
    if (activeDropdown.value === name) {
      activeDropdown.value = null
    }
  }, 200)
}

const toggleDropdown = (name: string) => {
  if (activeDropdown.value === name) {
    activeDropdown.value = null
  } else {
    Object.values(dropdownTimers).forEach((t) => t && clearTimeout(t))
    activeDropdown.value = name
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (headerRef.value && !headerRef.value.contains(e.target as Node)) {
    activeDropdown.value = null
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && activeDropdown.value) {
    activeDropdown.value = null
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  Object.values(dropdownTimers).forEach((t) => t && clearTimeout(t))
})
</script>

<style scoped lang="scss">
.app-header {
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
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    width: 100%;
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
      flex-shrink: 0;
      filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
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
  }

  .nav-links {
    display: flex;
    gap: 1.2rem;
    align-items: center;

    > a,
    .nav-dropdown > a {
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
      &.active,
      &.router-link-active {
        color: var(--text-primary);

        &::after {
          width: 100%;
        }
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

  .dropdown-chevron {
    font-size: 0.6rem;
    transition: transform 0.3s ease;
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
    text-decoration: none;

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

  .header-divider {
    width: 1px;
    height: 22px;
    background: rgba(255, 255, 255, 0.12);
    flex-shrink: 0;
  }

  .lang-switcher {
    display: flex;
    gap: 0.3rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    padding: 0.3rem;
    border-radius: 60px;
    border: 1px solid var(--glass-border);

    .lang-btn {
      background: transparent;
      border: none;
      font-size: 1.3rem;
      padding: 0.2rem 0.6rem;
      border-radius: 40px;
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: 0.6;
      transform: scale(0.9);
      line-height: 1;
      text-decoration: none;

      &.active {
        opacity: 1;
        transform: scale(1);
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 0 20px rgba(201, 168, 124, 0.3);
      }

      &:hover:not(.active) {
        opacity: 0.9;
        transform: scale(0.95);
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

      &:hover,
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
      cursor: pointer;

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

    .mobile-currency-section {
      margin: 1rem 0 0.5rem;
      display: flex;
      justify-content: center;
    }

    .mobile-lang {
      display: flex;
      justify-content: center;
      gap: 0.3rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);

      .lang-btn {
        background: transparent;
        border: none;
        font-size: 1.3rem;
        padding: 0.2rem 0.6rem;
        border-radius: 40px;
        cursor: pointer;
        transition: all 0.3s ease;
        opacity: 0.6;
        transform: scale(0.9);
        line-height: 1;
        text-decoration: none;
        color: var(--text-primary);

        &.active {
          opacity: 1;
          transform: scale(1);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 20px rgba(201, 168, 124, 0.3);
        }

        &:hover:not(.active) {
          opacity: 0.9;
          transform: scale(0.95);
        }
      }
    }
  }
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

.desktop-hidden {
  display: none !important;
}
</style>
