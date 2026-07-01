<template>
  <Transition name="exit-fade">
    <div v-if="visible" class="exit-overlay" @click.self="dismiss">
      <div class="exit-card glass-card">
        <button class="exit-close" @click="dismiss" aria-label="Close">&times;</button>

        <div class="exit-icon">
          <i class="fas fa-hand-peace"></i>
        </div>

        <h2 class="exit-title">Leaving so soon? Wait! 🛑</h2>
        <p class="exit-body">
          Complete your booking via WhatsApp right now and unlock a<br>
          <strong>FREE VIP Hotel Transfer</strong> in Agadir &amp; Taghazout.
        </p>

        <button class="exit-whatsapp" @click="claimOffer">
          <i class="fab fa-whatsapp"></i>
          Claim My VIP Transfer &amp; Book
        </button>

        <button class="exit-ghost" @click="dismiss">No thanks, I'll risk missing out</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const WHATSAPP_NUMBER = '+212615884469'
const STORAGE_KEY = 'abe_exit_seen'
const visible = ref(false)
let fired = false

function buildClaimUrl() {
  const text = 'Hello! I want to book an adventure and claim my FREE VIP Hotel Transfer [Offer: VIP_Transfer_Claimed]'
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

function claimOffer() {
  const url = buildClaimUrl()
  window.open(url, '_blank', 'noopener,noreferrer')
  dismiss()
}

function dismiss() {
  visible.value = false
}

function trigger() {
  if (fired) return
  fired = true
  localStorage.setItem(STORAGE_KEY, '1')
  visible.value = true
}

let scrollY = 0
let scrollTimer = null

function onMouseLeave(e) {
  if (fired) return
  if (e.clientY > 0) return
  trigger()
}

function onTouchStart() {
  scrollY = window.scrollY
}

function onTouchEnd() {
  if (fired) return
  const delta = window.scrollY - scrollY
  if (delta < -80) {
    trigger()
  }
}

onMounted(() => {
  if (localStorage.getItem(STORAGE_KEY)) return
  document.addEventListener('mouseleave', onMouseLeave)
  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchend', onTouchEnd)
})

onBeforeUnmount(() => {
  document.removeEventListener('mouseleave', onMouseLeave)
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchend', onTouchEnd)
  if (scrollTimer) clearTimeout(scrollTimer)
})
</script>

<style scoped lang="scss">
.exit-overlay {
  position: fixed;
  inset: 0;
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 26, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 1.5rem;
}

.exit-card {
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

.exit-close {
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

.exit-icon {
  font-size: 2.4rem;
  color: var(--accent);
  margin-bottom: 1rem;
}

.exit-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.exit-body {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;

  strong {
    color: var(--accent);
    font-weight: 500;
  }
}

.exit-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 2rem;
  border-radius: 60px;
  background: #25D366;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.02em;
  font-family: inherit;
  animation: pulse-whatsapp 2s ease-in-out infinite;

  i {
    font-size: 1.2rem;
  }

  &:hover {
    background: #20bd5a;
    transform: scale(1.04);
    box-shadow: 0 8px 30px rgba(37, 211, 102, 0.4);
    animation: none;
  }
}

.exit-ghost {
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

@keyframes pulse-whatsapp {
  0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
  50% { box-shadow: 0 0 0 14px rgba(37, 211, 102, 0); }
}

.exit-fade-enter-active,
.exit-fade-leave-active {
  transition: opacity 0.35s ease;
}

.exit-fade-enter-from,
.exit-fade-leave-to {
  opacity: 0;
}
</style>
