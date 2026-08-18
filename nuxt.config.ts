// FILE: nuxt.config.ts
export default defineNuxtConfig({
  // Step 1: Enable Server-Side Rendering for maximum SEO indexability
  ssr: true,

  // Step 18: Canonical site URL used for sitemap.xml generation
  site: {
    url: 'https://www.agadirberbereexperience.com',
  },

  // Step 18: Single consolidated multilingual sitemap (sitemaps: false disables
  // the per-locale child sitemaps so all URLs + hreflang live in sitemap.xml)
  sitemap: {
    sitemaps: false,
  },

  modules: [
    // Step 3: Internationalization with SEO-friendly sub-path URLs (/en, /fr, /ar)
    '@nuxtjs/i18n',
    // Step 4: Markdown content database (content/en, content/fr, content/ar)
    '@nuxt/content',
    // Step 18: Automatic multilingual sitemap generation
    '@nuxtjs/sitemap',
  ],

  i18n: {
    strategy: 'prefix',
    defaultLocale: 'en',
    baseUrl: 'https://www.agadirberbereexperience.com',
    // v9 defaults restructureDir to 'i18n' (resolves langDir under <root>/i18n/).
    // Disable it so langDir resolves from the project root: <root>/locales/
    restructureDir: false,
    locales: [
      { code: 'en', language: 'en-US', dir: 'ltr', file: 'en.json', name: 'English', flag: '🇬🇧' },
      { code: 'fr', language: 'fr-FR', dir: 'ltr', file: 'fr.json', name: 'Français', flag: '🇫🇷' },
      { code: 'ar', language: 'ar-MA', dir: 'rtl', file: 'ar.json', name: 'العربية', flag: '🇸🇦' },
    ],
    lazy: true,
    langDir: 'locales',
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1.0',
      link: [
        // Favicon
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' },
        // Preconnects (from legacy index.html)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://api.whatsapp.com' },
        { rel: 'preconnect', href: 'https://connect.facebook.net' },
        // Google Fonts: Cairo (Arabic) + Playfair Display + Inter
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300..700&display=swap',
        },
      ],
    },
  },

  // Global stylesheets (FontAwesome bundled from node_modules, glassmorphism via main.scss)
  css: [
    '@fortawesome/fontawesome-free/css/all.min.css',
    '~/assets/styles/main.scss',
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Make design tokens from variables.scss available in every SCSS block
          additionalData: '@use "~/assets/styles/variables.scss" as *;',
        },
      },
    },
  },
})
