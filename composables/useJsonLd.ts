import siteConfig from '~/data/siteConfig.json'

export interface ExperienceJsonLdInput {
  title?: string | null
  description?: string | null
  image?: string | null
  price?: string | number | null
  canonicalUrl?: string | null
}

export interface ArticleJsonLdInput {
  title?: string | null
  description?: string | null
  image?: string | null
  date?: string | null
  author?: string | null
  canonicalUrl?: string | null
}

const SITE_URL: string =
  (siteConfig as { website?: string }).website ??
  'https://www.agadirberbereexperience.com'

const ORG_ID = `${SITE_URL}/#organization`

const LOGO_URL =
  'https://res.cloudinary.com/nczftcee/image/upload/f_auto,q_auto/v1782908638/Design_sans_titre_1_1_b82llb.png'

const ORG_NAME = 'AGADIR berbère expérience'

function sameAsLinks(): string[] {
  const social = (siteConfig as {
    social?: { instagram?: string; facebook?: string }
    map?: { url?: string }
  }).social
  const mapUrl = (siteConfig as { map?: { url?: string } }).map?.url
  return [social?.instagram, social?.facebook, mapUrl].filter(
    (v): v is string => typeof v === 'string' && v.length > 0
  )
}

export function generateOrganizationSchema(): Record<string, unknown> {
  const telephone: string =
    (siteConfig as { whatsapp?: { number?: string } }).whatsapp?.number ??
    '+212615884469'
  return {
    '@context': 'https://schema.org',
    '@type': ['TouristInformationCenter', 'TravelAgency'],
    '@id': ORG_ID,
    name: ORG_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    image: LOGO_URL,
    telephone,
    email:
      (siteConfig as { email?: { primary?: string } }).email?.primary ??
      'info@agadirberbereexperience.com',
    priceRange: '250 MAD - 600 MAD',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kasbat Souss, Bensergaw',
      addressLocality: 'Agadir',
      postalCode: '80000',
      addressCountry: 'MA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.3878232,
      longitude: -9.5687388,
    },
    sameAs: sameAsLinks(),
  }
}

export function generateExperienceSchema(
  pageData: ExperienceJsonLdInput
): Record<string, unknown> {
  const priceNumber =
    typeof pageData.price === 'string'
      ? parseFloat(pageData.price)
      : (pageData.price ?? 0)
  return {
    '@context': 'https://schema.org',
    '@type': ['TouristTrip', 'Product'],
    name: pageData.title ?? '',
    description: pageData.description ?? '',
    ...(pageData.image ? { image: pageData.image } : {}),
    offers: {
      '@type': 'Offer',
      price: Number.isNaN(priceNumber) ? 0 : priceNumber,
      priceCurrency: 'MAD',
      availability: 'https://schema.org/InStock',
      ...(pageData.canonicalUrl ? { url: pageData.canonicalUrl } : {}),
    },
    provider: {
      '@id': ORG_ID,
      '@type': ['TouristInformationCenter', 'TravelAgency'],
      name: ORG_NAME,
    },
    tourOperator: ORG_NAME,
  }
}

export function generateArticleSchema(
  articleData: ArticleJsonLdInput
): Record<string, unknown> {
  const authorName = articleData.author?.trim()
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articleData.title ?? '',
    ...(articleData.description ? { description: articleData.description } : {}),
    ...(articleData.image ? { image: articleData.image } : {}),
    ...(articleData.date ? { datePublished: articleData.date } : {}),
    author: authorName
      ? { '@type': 'Person', name: authorName }
      : { '@id': ORG_ID },
    publisher: {
      '@id': ORG_ID,
      '@type': 'Organization',
      name: ORG_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    ...(articleData.canonicalUrl
      ? {
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleData.canonicalUrl,
          },
        }
      : {}),
  }
}
