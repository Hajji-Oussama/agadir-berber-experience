import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  const currentLocale = ref(localStorage.getItem('locale') || 'en')

  function setLocale(locale) {
    currentLocale.value = locale
    localStorage.setItem('locale', locale)
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = locale
  }

  const savedLang = localStorage.getItem('locale') || 'en'
  setLocale(savedLang)

  return { currentLocale, setLocale }
})
