export function updateSEO(locale, t) {
  const siteName = 'Agadir Berbère Expérience'
  const baseUrl = 'https://agadirberbereexperience.com'

  const meta = {
    en: {
      title: `${siteName} | Authentic Adventures, Cooking Class & Desert Tours in Agadir`,
      description: 'Cooking Masterclass, Quad, Buggy, Horse & Camel rides. Premium authentic Amazigh adventures in Agadir — guided by locals who live the desert.'
    },
    fr: {
      title: `${siteName} | Aventures Authentiques, Cours de Cuisine & Circuits Désert à Agadir`,
      description: 'Cours de Cuisine, Quad, Buggy, Balades à Cheval et à Chameau. Des aventures Amazighes authentiques et premium à Agadir — guidées par des locaux qui vivent le désert.'
    },
    ar: {
      title: `${siteName} | مغامرات أصيلة، دروس الطبخ وجولات الصحراء في أكادير`,
      description: 'دروس الطبخ، الكواد، البغي، ركوب الخيل والجمال. مغامرات أمازيغية أصيلة وفاخرة في أكادير — بإرشاد محليين يعيشون الصحراء.'
    }
  }

  const current = meta[locale] || meta.en

  document.title = current.title

  let descEl = document.querySelector('meta[name="description"]')
  if (!descEl) {
    descEl = document.createElement('meta')
    descEl.setAttribute('name', 'description')
    document.head.appendChild(descEl)
  }
  descEl.setAttribute('content', current.description)

  const hreflangs = [
    { lang: 'en', href: `${baseUrl}/en` },
    { lang: 'fr', href: `${baseUrl}/fr` },
    { lang: 'ar', href: `${baseUrl}/ar` },
    { lang: 'x-default', href: `${baseUrl}/en` }
  ]

  const existingLinks = document.querySelectorAll('link[hreflang]')
  existingLinks.forEach(el => el.remove())

  hreflangs.forEach(({ lang, href }) => {
    const link = document.createElement('link')
    link.setAttribute('rel', 'alternate')
    link.setAttribute('hreflang', lang)
    link.setAttribute('href', href)
    document.head.appendChild(link)
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'TravelAgency'],
        '@id': `${baseUrl}/#business`,
        name: siteName,
        alternateName: 'Agadir Berbere Experience',
        description: current.description,
        url: baseUrl,
        telephone: '+212615884469',
        email: 'info@agadirberbereexperience.com',
        foundingDate: '2018',
        founder: {
          '@type': 'Person',
          name: 'Agadir Berbère Expérience'
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Centre',
          addressLocality: 'Agadir',
          addressRegion: 'Souss-Massa',
          postalCode: '80000',
          addressCountry: 'MA'
        },
        location: {
          '@type': 'Place',
          name: 'Agadir Berbère Expérience',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Agadir',
            addressRegion: 'Souss-Massa',
            addressCountry: 'MA'
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 30.4278,
            longitude: -9.5981
          }
        },
        areaServed: {
          '@type': 'City',
          name: 'Agadir'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          bestRating: '5',
          ratingCount: '342',
          reviewCount: '342'
        },
        priceRange: '180-1200 MAD',
        image: `${baseUrl}/og-image.jpg`,
        sameAs: [
          'https://instagram.com/agadirberbereexperience',
          'https://facebook.com/agadirberbereexperience'
        ],
        knowsLanguage: ['en', 'fr', 'ar'],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '08:00',
            closes: '20:00'
          }
        ]
      },
      {
        '@type': 'ItemList',
        '@id': `${baseUrl}/#services`,
        name: 'Top Adventures in Agadir',
        description: 'Premium authentic Amazigh adventures in Agadir',
        itemListElement: [
          {
            '@type': 'Product',
            position: 1,
            name: 'Cooking Masterclass',
            description: 'Handpick fresh ingredients at the Souk, then master Tagine and Couscous with a traditional chef.',
            offers: {
              '@type': 'Offer',
              price: '450',
              priceCurrency: 'MAD',
              availability: 'https://schema.org/InStock',
              url: `${baseUrl}/#services`
            },
            image: `${baseUrl}/images/cooking.jpg`
          },
          {
            '@type': 'Product',
            position: 2,
            name: 'Quad Biking',
            description: '2 hours of raw adrenaline across the golden desert dunes.',
            offers: {
              '@type': 'Offer',
              price: '400',
              priceCurrency: 'MAD',
              availability: 'https://schema.org/InStock',
              url: `${baseUrl}/#services`
            },
            image: `${baseUrl}/images/quad.jpg`
          },
          {
            '@type': 'Product',
            position: 3,
            name: 'Buggy Off-Road',
            description: '2 hours conquering majestic dunes in a brand-new powerful buggy.',
            offers: {
              '@type': 'Offer',
              price: '800',
              priceCurrency: 'MAD',
              availability: 'https://schema.org/InStock',
              url: `${baseUrl}/#services`
            },
            image: `${baseUrl}/images/buggy.jpg`
          },
          {
            '@type': 'Product',
            position: 4,
            name: 'Horse Riding',
            description: 'Ride through Aghroud forests and the Souss River at golden hour.',
            offers: {
              '@type': 'Offer',
              price: '300',
              priceCurrency: 'MAD',
              availability: 'https://schema.org/InStock',
              url: `${baseUrl}/#services`
            },
            image: `${baseUrl}/images/horse.jpg`
          },
          {
            '@type': 'Product',
            position: 5,
            name: 'Camel Trekking',
            description: 'A gentle 2-hour journey through ancient forest trails with mint tea.',
            offers: {
              '@type': 'Offer',
              price: '180',
              priceCurrency: 'MAD',
              availability: 'https://schema.org/InStock',
              url: `${baseUrl}/#services`
            },
            image: `${baseUrl}/images/camel.jpg`
          }
        ]
      }
    ]
  }

  let existingJson = document.querySelector('script[type="application/ld+json"]')
  if (!existingJson) {
    existingJson = document.createElement('script')
    existingJson.setAttribute('type', 'application/ld+json')
    document.head.appendChild(existingJson)
  }
  existingJson.textContent = JSON.stringify(jsonLd)
}
