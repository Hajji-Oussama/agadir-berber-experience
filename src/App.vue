<template>
  <div id="app">
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
  </div>
</template>

<script setup>
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat.vue'
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
