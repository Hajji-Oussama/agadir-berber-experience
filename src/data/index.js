import servicesEN from './services/en.json'
import servicesFR from './services/fr.json'
import servicesAR from './services/ar.json'

import tripsEN from './trips/en.json'
import tripsFR from './trips/fr.json'
import tripsAR from './trips/ar.json'

import galleryEN from './gallery/en.json'
import galleryFR from './gallery/fr.json'
import galleryAR from './gallery/ar.json'

import testimonialsEN from './testimonials/en.json'
import testimonialsFR from './testimonials/fr.json'
import testimonialsAR from './testimonials/ar.json'

import statsEN from './stats/en.json'
import statsFR from './stats/fr.json'
import statsAR from './stats/ar.json'

const dataMap = {
  en: {
    services: servicesEN,
    trips: tripsEN,
    gallery: galleryEN,
    testimonials: testimonialsEN,
    stats: statsEN
  },
  fr: {
    services: servicesFR,
    trips: tripsFR,
    gallery: galleryFR,
    testimonials: testimonialsFR,
    stats: statsFR
  },
  ar: {
    services: servicesAR,
    trips: tripsAR,
    gallery: galleryAR,
    testimonials: testimonialsAR,
    stats: statsAR
  }
}

export function getData(locale = 'en') {
  return dataMap[locale] || dataMap.en
}

export function getServices(locale = 'en') {
  return getData(locale).services
}

export function getTrips(locale = 'en') {
  return getData(locale).trips
}

export function getGallery(locale = 'en') {
  return getData(locale).gallery
}

export function getTestimonials(locale = 'en') {
  return getData(locale).testimonials
}

export function getStats(locale = 'en') {
  return getData(locale).stats
}
