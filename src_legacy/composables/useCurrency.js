import { ref } from 'vue'
import currencyConfig from '@/data/currencyConfig.json'

const activeCurrency = ref(currencyConfig.defaultDisplay)

function formatPrice(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return ''
  const converted = num * currencyConfig.rates[activeCurrency.value]
  const symbol = currencyConfig.symbols[activeCurrency.value]
  const formatted = converted.toFixed(2).replace(/\.00$/, '')
  if (symbol.length > 1) {
    return `${formatted} ${symbol}`
  }
  return `${symbol}${formatted}`
}

export function useCurrency() {
  return { activeCurrency, formatPrice }
}
