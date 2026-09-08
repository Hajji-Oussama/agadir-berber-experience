<template>
  <div class="table-container">
    <div class="table-scroller">
      <table class="glass-table">
        <slot />
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 2rem 0;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.table-scroller {
  width: 100%;
  max-width: 100%;
  display: block;
  box-sizing: border-box;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--accent) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--accent);
    border-radius: 3px;
  }
}

.glass-table {
  width: 100%;
  min-width: 480px;
  border-collapse: collapse;
  text-align: start;

  :deep(th) {
    background: rgba(201, 168, 124, 0.12);
    color: var(--accent);
    padding: 1rem 1.25rem;
    font-family: var(--font-heading);
    font-weight: 400;
    font-size: 1rem;
    text-align: start;
    white-space: nowrap;
    border-bottom: 1px solid rgba(201, 168, 124, 0.3);
  }

  :deep(td) {
    padding: 0.9rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 300;
    line-height: 1.6;
  }

  :deep(tr:last-child td) {
    border-bottom: none;
  }

  :deep(tr:hover td) {
    background: rgba(255, 255, 255, 0.02);
  }
}

[dir="rtl"] .glass-table {
  :deep(th),
  :deep(td) {
    text-align: right;
  }
}

[dir="ltr"] .glass-table {
  :deep(th),
  :deep(td) {
    text-align: left;
  }
}
</style>
