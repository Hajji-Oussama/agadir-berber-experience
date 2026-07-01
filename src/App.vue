<template>
  <div id="app">
    <div class="scroll-progress" ref="progressBar" aria-hidden="true"></div>

    <div class="ambient-blobs" aria-hidden="true">
      <div class="ambient-blob ambient-blob--gold"></div>
      <div class="ambient-blob ambient-blob--teal"></div>
      <div class="ambient-blob ambient-blob--white"></div>
    </div>

    <Header />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <Footer />

    <WhatsAppFloat />

    <BookingLoader />
    <CookieBanner />
    <ExitIntentModal />
    <PhantomSocialProof />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat.vue'
import BookingLoader from '@/components/common/BookingLoader.vue'
import CookieBanner from '@/components/common/CookieBanner.vue'
import ExitIntentModal from '@/components/common/ExitIntentModal.vue'
import PhantomSocialProof from '@/components/common/PhantomSocialProof.vue'
import { popLastGuard } from '@/composables/useBackGuard'
import { updateSEO } from '@/composables/useSEO'

const progressBar = ref(null)

const { locale, t } = useI18n()

watch(locale, (newLocale) => {
  updateSEO(newLocale, t)
}, { immediate: true })

const updateProgress = () => {
  if (!progressBar.value) return
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
  progressBar.value.style.width = `${progress}%`
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress, { passive: true })
  window.addEventListener('popstate', popLastGuard)
  updateProgress()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
  window.removeEventListener('popstate', popLastGuard)
})
</script>

<style lang="scss">
@use '@/assets/styles/main.scss';

#app {
  font-family: var(--font-body);
  background: var(--bg-gradient);
  color: var(--text-primary);
  min-height: 100vh;
  position: relative;
}

.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 2px;
  background: var(--accent);
  z-index: 10001;
  transition: width 0.1s linear;
  pointer-events: none;
  will-change: width;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
