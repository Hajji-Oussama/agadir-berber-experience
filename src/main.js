import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/styles/main.scss'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'

const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, fr, ar }
})

document.documentElement.dir = savedLocale === 'ar' ? 'rtl' : 'ltr'
document.documentElement.lang = savedLocale

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')

setTimeout(() => {
  AOS.init({
    duration: 800,
    once: true,
    easing: 'ease-out-cubic'
  })
}, 100)
