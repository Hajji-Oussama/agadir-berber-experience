<template>
  <div class="admin-shell" dir="ltr">
    <!-- 1. Session check skeleton: nothing else exists in DOM yet -->
    <div v-if="isChecking" class="admin-checking">
      <div class="admin-spinner">CMS Studio…</div>
    </div>

    <!-- 2. Lock screen: the ONLY element rendered when unauthenticated -->
    <AdminLockScreen v-else-if="!isAuthenticated" @authenticated="handleAuth" />

    <!-- 3. Authenticated pages: completely ABSENT from DOM until then -->
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
const isChecking = ref(true)
const isAuthenticated = ref(false)

async function checkSession(): Promise<boolean> {
  try {
    const res = await $fetch<{ authenticated: boolean }>('/api/admin/auth/check')
    return res?.authenticated === true
  } catch {
    return false
  }
}

function setAuthenticated(value: boolean): void {
  isAuthenticated.value = value
}

async function handleAuth(): Promise<void> {
  setAuthenticated(true)
}

provide('admin-auth', {
  isAuthenticated: readonly(isAuthenticated),
  setAuthenticated,
})

onMounted(async () => {
  setAuthenticated(await checkSession())
  isChecking.value = false
})
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-gradient);
  color: var(--text-primary);
}

.admin-checking {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
}

.admin-spinner {
  color: var(--accent);
  font-size: 1rem;
  animation: admin-pulse 1.2s ease-in-out infinite;
}

@keyframes admin-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
</style>
