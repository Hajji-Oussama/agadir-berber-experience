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

export interface ContentNode {
  type?: string
  tag?: string
  value?: string
  children?: ContentNode[]
}

export interface ContentBody {
  type?: string
  children?: ContentNode[]
}

export interface FaqItem {
  question: string
  answer: string
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

const FAQ_HEADING_PATTERN = /faq|frequently asked|questions fréquentes|أسئلة/i

function getTextContent(node: ContentNode | null | undefined): string {
  if (!node) return ''
  if (node.type === 'text') return node.value ?? ''
  if (Array.isArray(node.children)) return node.children.map(getTextContent).join('')
  return ''
}

function isFaqHeading(node: ContentNode | null | undefined): boolean {
  return (
    node?.type === 'element' &&
    (node.tag === 'h2' || node.tag === 'h3') &&
    FAQ_HEADING_PATTERN.test(getTextContent(node).trim())
  )
}

function isParagraph(node: ContentNode | null | undefined): boolean {
  return node?.type === 'element' && node.tag === 'p'
}

// Bold-paragraph questions: a <p> whose entire content is a single <strong>
// ending with '?', e.g. the `**Is Agadir safe?**` pattern used in our guides.
function asBoldQuestion(node: ContentNode | null | undefined): string | null {
  if (!isParagraph(node)) return null
  const meaningful = (node?.children ?? []).filter(
    (c) => !(c.type === 'text' && (c.value ?? '').trim() === '')
  )
  if (meaningful.length !== 1) return null
  const only = meaningful[0]
  if (only.type !== 'element' || only.tag !== 'strong') return null
  const text = getTextContent(only).trim()
  if (!text || !text.endsWith('?')) return null
  return text
}

export function extractFaqItems(
  contentBody: ContentBody | null | undefined
): FaqItem[] {
  const items: FaqItem[] = []
  const children = contentBody?.children
  if (!Array.isArray(children)) return items

  let inFaqSection = false
  let i = 0
  while (i < children.length) {
    const node = children[i]
    const isH2 = node?.type === 'element' && node.tag === 'h2'
    const isH3 = node?.type === 'element' && node.tag === 'h3'

    if (isH2) {
      inFaqSection = isFaqHeading(node)
      i += 1
      continue
    }

    // An h3 that itself looks like an FAQ heading opens a section;
    // any other h3 inside a section is handled as a question below.
    if (isH3 && isFaqHeading(node)) {
      inFaqSection = true
      i += 1
      continue
    }

    if (!inFaqSection) {
      i += 1
      continue
    }

    // Path A (spec): subsequent sibling h3 tags are questions,
    // adjacent p tags are answers.
    if (isH3) {
      const question = getTextContent(node).trim()
      const answers: string[] = []
      i += 1
      while (i < children.length && isParagraph(children[i])) {
        const text = getTextContent(children[i]).trim()
        if (text) answers.push(text)
        i += 1
      }
      const answer = answers.join('\n\n')
      if (question && answer) items.push({ question, answer })
      continue
    }

    // Path B (house style): bold-paragraph questions followed by
    // answer paragraphs, e.g. `**Is Agadir safe?**` + answer <p>.
    const boldQuestion = asBoldQuestion(node)
    if (boldQuestion) {
      const answers: string[] = []
      i += 1
      while (
        i < children.length &&
        isParagraph(children[i]) &&
        !asBoldQuestion(children[i])
      ) {
        const text = getTextContent(children[i]).trim()
        if (text) answers.push(text)
        i += 1
      }
      const answer = answers.join('\n\n')
      if (answer) items.push({ question: boldQuestion, answer })
      continue
    }

    i += 1
  }

  return items
}

export function generateFaqPageSchema(
  items: FaqItem[] | null | undefined
): Record<string, unknown> | null {
  const valid = (Array.isArray(items) ? items : []).filter(
    (item) => item?.question?.trim() && item?.answer?.trim()
  )
  if (!valid.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: valid.map((item) => ({
      '@type': 'Question',
      name: item.question.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.trim(),
      },
    })),
  }
}
