import { useI18n } from 'vue-i18n'

const SUPPORTED_LOCALES = ['en', 'fr', 'ar']

function applyLocale(locale) {
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = locale
  localStorage.setItem('locale', locale)
}

export function initLocale() {
  const saved = localStorage.getItem('locale')
  const locale = SUPPORTED_LOCALES.includes(saved) ? saved : 'en'
  applyLocale(locale)
  return locale
}

export function useLanguage() {
  const { locale } = useI18n()

  function switchLanguage(code) {
    if (!SUPPORTED_LOCALES.includes(code)) return
    locale.value = code
    applyLocale(code)
    window.dispatchEvent(new Event('resize'))
  }

  return { locale, switchLanguage }
}
