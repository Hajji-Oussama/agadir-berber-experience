<template>
  <Transition name="promo-fade">
    <div v-if="visible" class="promo-overlay" @click.self="dismiss">
      <div class="promo-card glass-card">
        <button class="promo-close" @click="dismiss" aria-label="Close">&times;</button>

        <div class="promo-icon">
          <i class="fas fa-tag"></i>
        </div>

        <h2 class="promo-title">{{ $t('promo.modal_title') }}</h2>
        <p class="promo-body">{{ $t('promo.modal_desc') }}</p>

        <button class="promo-cta" @click="claimOffer">
          {{ $t('promo.view_offer') }}
        </button>

        <button class="promo-ghost" @click="dismiss">{{ $t('services.less') }}</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import promoConfig from '@/data/promoConfig.json'

const STORAGE_KEY = 'abe_promo_seen'
const visible = ref(false)

function claimOffer() {
  dismiss()
  const el = document.getElementById('services')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const card = document.querySelector('[data-id="horse"]')
  if (card) {
    card.classList.add('card-highlight')
    setTimeout(() => card.classList.remove('card-highlight'), 1500)
  }
}

function dismiss() {
  visible.value = false
}

function trigger() {
  localStorage.setItem(STORAGE_KEY, Date.now().toString())
  visible.value = true
}

onMounted(() => {
  if (!promoConfig.isActive) return
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const elapsed = Date.now() - parseInt(stored, 10)
    if (elapsed < 86400000) return
  }
  setTimeout(trigger, 3000)
})
</script>

<style scoped lang="scss">
.promo-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 26, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 1.5rem;
}

.promo-card {
  position: relative;
  max-width: 460px;
  width: 100%;
  padding: 2.5rem 2rem 2rem;
  border-radius: 24px;
  background: rgba(10, 14, 26, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  text-align: center;
}

.promo-close {
  position: absolute;
  top: 0.8rem;
  right: 1.2rem;
  background: none;
  border: none;
  font-size: 1.6rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.3s;
  line-height: 1;

  &:hover {
    color: var(--text-primary);
  }
}

.promo-icon {
  font-size: 2.4rem;
  color: var(--accent);
  margin-bottom: 1rem;
}

.promo-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.promo-body {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.promo-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 2rem;
  border-radius: 60px;
  background: var(--accent);
  color: #000;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.02em;
  font-family: inherit;
  animation: pulse-cta 2s ease-in-out infinite;

  &:hover {
    background: #d4b88a;
    transform: scale(1.04);
    box-shadow: 0 8px 30px rgba(201, 168, 124, 0.4);
    animation: none;
  }
}

.promo-ghost {
  display: block;
  margin: 1rem auto 0;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.78rem;
  cursor: pointer;
  transition: color 0.3s;
  font-family: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: var(--text-secondary);
  }
}

@keyframes pulse-cta {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201, 168, 124, 0.5); }
  50% { box-shadow: 0 0 0 14px rgba(201, 168, 124, 0); }
}

.promo-fade-enter-active,
.promo-fade-leave-active {
  transition: opacity 0.35s ease;
}

.promo-fade-enter-from,
.promo-fade-leave-to {
  opacity: 0;
}
</style>
