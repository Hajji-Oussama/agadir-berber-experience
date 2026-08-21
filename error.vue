<script setup lang="ts">
defineProps<{ error?: object }>()

const { locale } = useI18n()
const localePath = useLocalePath()

const handleError = () => clearError({ redirect: localePath('/') })

useHead({
  title: `${locale.value === 'ar' ? 'خطأ' : locale.value === 'fr' ? 'Erreur' : 'Error'} - Agadir Berbère Expérience`,
})
</script>

<template>
  <div class="error-page">
    <div class="ambient-blobs" aria-hidden="true">
      <div class="ambient-blob ambient-blob--gold"></div>
      <div class="ambient-blob ambient-blob--teal"></div>
    </div>

    <div class="container error-content">
      <div class="glass-card error-card">
        <span class="error-code">{{ error?.statusCode || 404 }}</span>
        <div class="error-badge"><i class="fas fa-mountain"></i></div>

        <h1>{{ locale === 'ar' ? 'الصفحة غير موجودة' : locale === 'fr' ? 'Page Introuvable' : 'Page Not Found' }}</h1>
        <p>{{
          locale === 'ar'
            ? 'المسار الذي تبحث عنه اختفى وسط الكثبان.'
            : locale === 'fr'
              ? 'Le chemin que vous cherchez s\u2019est effacé dans les dunes.'
              : 'The trail you are looking for has vanished into the dunes.'
        }}</p>

        <button class="btn btn--primary" @click="handleError">
          {{ locale === 'ar' ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\u2019Accueil' : 'Return to Oasis (Home)' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  background: var(--bg-gradient);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
}

.error-content {
  position: relative;
  z-index: 2;
}

.error-card {
  max-width: 560px;
  margin: 0 auto;
  padding: 3rem 2.5rem;
  text-align: center;
}

.error-code {
  font-family: var(--font-heading);
  font-size: clamp(5rem, 15vw, 8rem);
  font-weight: 300;
  color: var(--accent);
  line-height: 1;
  display: block;
  text-shadow: 0 4px 40px rgba(201, 168, 124, 0.25);
}

.error-badge {
  width: 64px;
  height: 64px;
  margin: 1.5rem auto;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 1.6rem;
}

.error-card h1 {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.error-card p {
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.btn--primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 2.5rem;
  min-height: 48px;
  border-radius: 60px;
  background: var(--accent);
  color: #000;
  font-weight: 500;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  }
}
</style>
