<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-main">
      <slot />
    </main>
    <AppFooter />
    <WhatsAppFloat />
  </div>
</template>

<style scoped lang="scss">
.app-main {
  padding-top: 6rem;
  min-height: 70vh;
}
</style>
