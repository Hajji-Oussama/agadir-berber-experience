<template>
  <Transition name="proof-slide">
    <div v-if="current" class="proof-toast">
      <div class="proof-avatar">{{ current.initial }}</div>
      <div class="proof-body">
        <span class="proof-name">{{ current.label }}</span>
        <span class="proof-action">just booked <strong>{{ current.service }}</strong>! 🔥</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const proofs = [
  { initial: 'J', name: 'Jean from Paris', service: 'Buggy Off-Road' },
  { initial: 'S', name: 'Sarah from London', service: 'Cooking Masterclass' },
  { initial: 'Y', name: 'Youssef from Casablanca', service: 'Quad Biking' },
  { initial: 'E', name: 'Emma from Berlin', service: 'Camel Trekking' },
  { initial: 'M', name: 'Mohamed from Marrakech', service: 'Horse Riding' },
  { initial: 'L', name: 'Lena from Amsterdam', service: 'Cooking Masterclass' },
  { initial: 'A', name: 'Ahmed from Rabat', service: 'Buggy Off-Road' },
  { initial: 'C', name: 'Claire from Lyon', service: 'Quad Biking' },
  { initial: 'D', name: 'David from Manchester', service: 'Camel Trekking' },
  { initial: 'F', name: 'Fatima from Fes', service: 'Horse Riding' }
]

const current = ref(null)
let showTimer = null
let hideTimer = null

function pickRandom() {
  const shuffled = [...proofs].sort(() => Math.random() - 0.5)
  return shuffled[0]
}

function scheduleNext() {
  const delay = Math.floor(Math.random() * (25000 - 12000 + 1)) + 12000
  showTimer = setTimeout(showToast, delay)
}

function showToast() {
  current.value = pickRandom()
  hideTimer = setTimeout(hideToast, 4000)
}

function hideToast() {
  current.value = null
  scheduleNext()
}

onMounted(() => {
  setTimeout(scheduleNext, 5000)
})

onBeforeUnmount(() => {
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<style scoped lang="scss">
.proof-toast {
  position: fixed;
  bottom: 6rem;
  left: 1.5rem;
  z-index: 99997;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.2rem;
  border-radius: 14px;
  background: rgba(10, 14, 26, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  max-width: 300px;

  @media (max-width: 768px) {
    bottom: 5rem;
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}

.proof-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  flex-shrink: 0;
}

.proof-body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.proof-name {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.proof-action {
  font-size: 0.78rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  strong {
    color: var(--accent);
    font-weight: 500;
  }
}

.proof-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.proof-slide-leave-active {
  transition: all 0.3s ease;
}

.proof-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.proof-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
