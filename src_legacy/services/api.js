import servicesEN from '@/data/services/en.json'
import servicesFR from '@/data/services/fr.json'
import servicesAR from '@/data/services/ar.json'

import tripsEN from '@/data/trips/en.json'
import tripsFR from '@/data/trips/fr.json'
import tripsAR from '@/data/trips/ar.json'

import galleryEN from '@/data/gallery/en.json'
import galleryFR from '@/data/gallery/fr.json'
import galleryAR from '@/data/gallery/ar.json'

import testimonialsEN from '@/data/testimonials/en.json'
import testimonialsFR from '@/data/testimonials/fr.json'
import testimonialsAR from '@/data/testimonials/ar.json'

import statsEN from '@/data/stats/en.json'
import statsFR from '@/data/stats/fr.json'
import statsAR from '@/data/stats/ar.json'

import slidesData from '@/data/slides.json'

const dataMap = {
  en: { services: servicesEN, trips: tripsEN, gallery: galleryEN, testimonials: testimonialsEN, stats: statsEN },
  fr: { services: servicesFR, trips: tripsFR, gallery: galleryFR, testimonials: testimonialsFR, stats: statsFR },
  ar: { services: servicesAR, trips: tripsAR, gallery: galleryAR, testimonials: testimonialsAR, stats: statsAR }
}

function delay(ms = 120) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function fetchServices(locale = 'en') {
  await delay()
  return dataMap[locale]?.services ?? dataMap.en.services
}

export async function fetchTrips(locale = 'en') {
  await delay()
  return dataMap[locale]?.trips ?? dataMap.en.trips
}

export async function fetchGallery(locale = 'en') {
  await delay()
  return dataMap[locale]?.gallery ?? dataMap.en.gallery
}

export async function fetchTestimonials(locale = 'en') {
  await delay()
  return dataMap[locale]?.testimonials ?? dataMap.en.testimonials
}

export async function fetchStats(locale = 'en') {
  await delay()
  return dataMap[locale]?.stats ?? dataMap.en.stats
}

export async function fetchSlides() {
  await delay()
  return slidesData
}
