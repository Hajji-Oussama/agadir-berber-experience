<template>
  <Transition name="cookie-fade">
    <div v-if="visible" class="cookie-banner">
      <div class="cookie-banner-inner">
        <div class="cookie-text">
          <p class="cookie-main">
            We use cookies and similar technologies to enhance your experience, analyze traffic, and personalize ads. By clicking 'Accept All', you consent to our use of cookies.
          </p>
          <p class="cookie-alt">
            Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser les publicités.
          </p>
        </div>
        <div class="cookie-actions">
          <button class="cookie-btn cookie-btn--primary" @click="acceptAll">
            Accept All
          </button>
          <button class="cookie-btn cookie-btn--ghost" @click="acceptEssential">
            Essential Only
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'abe_cookie_consent'
const visible = ref(false)

onMounted(() => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    visible.value = true
  }
})

function acceptAll() {
  localStorage.setItem(STORAGE_KEY, 'all')
  visible.value = false
}

function acceptEssential() {
  localStorage.setItem(STORAGE_KEY, 'essential')
  visible.value = false
}
</script>

<style scoped lang="scss">
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  padding: 1rem 2rem 1.5rem;
  background: rgba(10, 14, 26, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
}

.cookie-banner-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.cookie-text {
  flex: 1;
  min-width: 0;
}

.cookie-main {
  margin: 0 0 0.25rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
  letter-spacing: 0.01em;
}

.cookie-alt {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.35);
  font-style: italic;
}

.cookie-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;

    .cookie-btn {
      flex: 1;
      text-align: center;
    }
  }
}

.cookie-btn {
  padding: 0.6rem 1.5rem;
  border-radius: 60px;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-family: inherit;

  &--primary {
    background: var(--accent);
    color: #000;

    &:hover {
      transform: scale(1.03);
      box-shadow: 0 6px 20px rgba(var(--accent-rgb, 201, 168, 124), 0.35);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid rgba(255, 255, 255, 0.15);

    &:hover {
      color: var(--text-primary);
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.cookie-fade-enter-active,
.cookie-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.cookie-fade-enter-from,
.cookie-fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
