// Services catalog — single source of truth for the CMS Studio.
// Mirrors Section 3 of content_template.md. Prices and links here are the
// verified official values; edit them only when the business changes them.

export interface ServiceItem {
  id: string
  prices: { mad: string; eur: string }
  duration: string
  titles: { ar: string; en: string; fr: string }
  links: { ar: string; en: string; fr: string }
}

export const servicesCatalog: ServiceItem[] = [
  {
    id: 'quad-biking',
    prices: { mad: '400 MAD', eur: '~€38' },
    duration: '2 hours',
    titles: { ar: 'كواد', en: 'Quad Biking', fr: 'Quad Biking' },
    links: {
      ar: '/ar/experiences/quad-biking',
      en: '/en/experiences/quad-biking',
      fr: '/fr/experiences/quad-biking',
    },
  },
  {
    id: 'buggy-off-road',
    prices: { mad: '600 MAD', eur: '~€56' },
    duration: '2 hours',
    titles: { ar: 'بوجي', en: 'Buggy Off-Road', fr: 'Buggy Off-Road' },
    links: {
      ar: '/ar/experiences/buggy-off-road',
      en: '/en/experiences/buggy-off-road',
      fr: '/fr/experiences/buggy-off-road',
    },
  },
  {
    id: 'horse-riding',
    prices: { mad: '350 MAD', eur: '~€33' },
    duration: '2 hours',
    titles: { ar: 'ركوب الخيل', en: 'Horse Riding', fr: 'Horse Riding' },
    links: {
      ar: '/ar/experiences/horse-riding',
      en: '/en/experiences/horse-riding',
      fr: '/fr/experiences/horse-riding',
    },
  },
  {
    id: 'camel-trekking',
    prices: { mad: '300 MAD', eur: '~€28' },
    duration: '2 hours',
    titles: { ar: 'ركوب الجمال', en: 'Camel Trekking', fr: 'Camel Trekking' },
    links: {
      ar: '/ar/experiences/camel-trekking',
      en: '/en/experiences/camel-trekking',
      fr: '/fr/experiences/camel-trekking',
    },
  },
  {
    id: 'cooking-class',
    prices: { mad: '350 MAD', eur: '~€33' },
    duration: '4-5 hours',
    titles: { ar: 'ورشة الطبخ المغربي', en: 'Cooking Masterclass', fr: 'Cooking Masterclass' },
    links: {
      ar: '/ar/experiences/cooking-class',
      en: '/en/experiences/cooking-class',
      fr: '/fr/experiences/cooking-class',
    },
  },
  {
    id: 'pottery-workshop',
    prices: { mad: '250 MAD', eur: '~€24' },
    duration: '2 hours',
    titles: { ar: 'ورشة الفخار', en: 'Pottery Workshop', fr: 'Pottery Workshop' },
    links: {
      ar: '/ar/experiences/pottery-workshop',
      en: '/en/experiences/pottery-workshop',
      fr: '/fr/experiences/pottery-workshop',
    },
  },
]

export function getServiceById(id: string): ServiceItem | undefined {
  return servicesCatalog.find((service) => service.id === id)
}
