// src/components/common/GlassCard.vue
<template>
  <div
    ref="cardRef"
    class="glass-card"
    :class="{ clickable: clickable, 'tilt-enabled': tiltEnabled }"
    @click="$emit('click')"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  clickable: { type: Boolean, default: false },
  tiltEnabled: { type: Boolean, default: false }
})

defineEmits(['click'])

const cardRef = ref(null)
const isTouchDevice = ref(false)

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

function onMouseMove(e) {
  if (!props.tiltEnabled || isTouchDevice.value || !cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = ((y - centerY) / centerY) * -8
  const rotateY = ((x - centerX) / centerX) * 8
  cardRef.value.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
}

function onMouseLeave() {
  if (!props.tiltEnabled || !cardRef.value) return
  cardRef.value.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
}
</script>

<style scoped lang="scss">
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.8rem;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;

  &.clickable {
    cursor: pointer;
    &:hover {
      transform: translateY(-8px);
      border-color: var(--accent);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }
  }

  &.tilt-enabled {
    will-change: transform;
  }
}
</style>
