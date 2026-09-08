<template>
  <div class="comparison-table">
    <div v-if="title" class="comparison-title">{{ title }}</div>
    <div v-if="subtitle" class="comparison-subtitle">{{ subtitle }}</div>
    <div class="comparison-scroller">
      <table class="comparison-grid">
        <thead>
          <tr>
            <th scope="col" class="col-label">{{ col1Header }}</th>
            <th scope="col" class="col-opt" :class="{ 'col-opt--highlight': !!col2Badge }">
              <span v-if="col2Badge" class="col-badge">{{ col2Badge }}</span>
              <span class="col-name">{{ col2Header }}</span>
              <span v-if="col2Price" class="col-price">{{ col2Price }}</span>
            </th>
            <th scope="col" class="col-opt" :class="{ 'col-opt--highlight': !!col3Badge }">
              <span v-if="col3Badge" class="col-badge">{{ col3Badge }}</span>
              <span class="col-name">{{ col3Header }}</span>
              <span v-if="col3Price" class="col-price">{{ col3Price }}</span>
            </th>
          </tr>
        </thead>
        <tbody v-if="items.length">
          <tr v-for="(item, index) in items" :key="index">
            <th scope="row" class="row-label">{{ item.label }}</th>
            <td :class="cellClass(item.winner, 'val1')">{{ item.val1 }}</td>
            <td :class="cellClass(item.winner, 'val2')">{{ item.val2 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ComparisonItem {
  label: string
  val1: string
  val2: string
  winner?: 'col1' | 'col2' | 'equal'
}

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    col1Header?: string
    col2Header?: string
    col3Header?: string
    col2Badge?: string
    col3Badge?: string
    col2Price?: string
    col3Price?: string
    items?: ComparisonItem[]
  }>(),
  {
    title: '',
    subtitle: '',
    col1Header: 'الميزة / Feature',
    col2Header: 'الكواد / Quad',
    col3Header: 'الباغي / Buggy',
    col2Badge: '',
    col3Badge: '',
    col2Price: '',
    col3Price: '',
    items: () => [],
  }
)

// winner 'col1' highlights the first option cell (val1),
// 'col2' highlights the second option cell (val2), 'equal' ties both.
function cellClass(winner: ComparisonItem['winner'], cell: 'val1' | 'val2'): string {
  if (winner === 'equal') return 'cell--tie'
  if (cell === 'val1' && winner === 'col1') return 'cell--winner'
  if (cell === 'val2' && winner === 'col2') return 'cell--winner'
  return ''
}
</script>

<style scoped lang="scss">
.comparison-table {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  margin: 2rem 0;
  padding: 2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  background-image: linear-gradient(135deg, rgba(201, 168, 124, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 168, 124, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  @media (max-width: 640px) {
    padding: 1.25rem;
  }
}

.comparison-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 0.5rem;
}

.comparison-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 300;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.comparison-scroller {
  width: 100%;
  max-width: 100%;
  display: block;
  box-sizing: border-box;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 14px;
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

.comparison-grid {
  width: 100%;
  min-width: 560px;
  border-collapse: separate;
  border-spacing: 0;
  text-align: center;

  th,
  td {
    padding: 0.9rem 1.1rem;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  thead th {
    font-family: var(--font-heading);
    font-weight: 400;
    border-bottom: 1px solid rgba(201, 168, 124, 0.3);
  }

  tbody th,
  tbody td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
}

.col-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: start;
}

.row-label {
  color: var(--text-primary);
  font-weight: 500;
  text-align: start;
  background: rgba(13, 17, 29, 0.92);
  position: sticky;
  left: 0;
  z-index: 1;
}

.col-opt {
  color: var(--text-primary);

  &--highlight {
    background: rgba(201, 168, 124, 0.1);
  }

  &:first-of-type {
    border-start-start-radius: 14px;
  }

  &:last-child {
    border-start-end-radius: 14px;
  }
}

.col-badge {
  display: inline-block;
  margin-bottom: 0.4rem;
  padding: 0.25rem 0.9rem;
  border-radius: 60px;
  background: rgba(201, 168, 124, 0.16);
  border: 1px solid rgba(201, 168, 124, 0.5);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.col-name {
  display: block;
  font-size: 1.1rem;
}

.col-price {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--accent);
}

tbody td {
  color: var(--text-secondary);
  font-weight: 300;
}

.cell--winner {
  color: var(--accent);
  font-weight: 600;
  background: rgba(201, 168, 124, 0.08);
}

.cell--tie {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

[dir="rtl"] {
  .col-label,
  .row-label {
    text-align: right;
  }

  .row-label {
    left: auto;
    right: 0;
  }

  .comparison-grid {
    direction: rtl;
  }
}

[dir="ltr"] {
  .col-label,
  .row-label {
    text-align: left;
  }

  .comparison-grid {
    direction: ltr;
  }
}
</style>
