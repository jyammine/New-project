import type { CollectionSlug, Payload } from 'payload'
import sharp from 'sharp'

import type { Page } from '@/payload-types'

import { categorySvg, garmentSvg, heroSvg, shareImageSvg, studioSvg } from './illustrations'
import { bold, h, link, p, richText, ul } from './lexical'
import { seedCategories, seedProducts } from './products'

type SeedOptions = {
  /** Delete existing shop content before seeding. */
  reset?: boolean
  admin?: { email: string; password: string; name?: string }
}

const context = { disableRevalidate: true }

const CONTENT_COLLECTIONS: CollectionSlug[] = [
  'orders',
  'products',
  'categories',
  'pages',
  'media',
  'subscribers',
  'inquiries',
]

type Layout = NonNullable<Page['layout']>
type LinkInput = {
  type: 'reference' | 'custom'
  label: string
  url?: string
  reference?: { relationTo: 'pages' | 'products' | 'categories'; value: number }
  appearance?: 'primary' | 'secondary' | 'link'
}

const custom = (label: string, url: string, appearance?: LinkInput['appearance']): LinkInput => ({
  type: 'custom',
  label,
  url,
  appearance,
})
const ref = (
  label: string,
  relationTo: 'pages' | 'categories' | 'products',
  value: number,
): LinkInput => ({
  type: 'reference',
  label,
  reference: { relationTo, value },
})

export async function seed(
  payload: Payload,
  options: SeedOptions = {},
): Promise<{ skipped: boolean }> {
  const existing = await payload.count({ collection: 'products', overrideAccess: true })

  if (existing.totalDocs > 0 && !options.reset) {
    payload.logger.info(
      'The database already has products — skipping seed. Run `pnpm seed reset` to replace all content.',
    )
    return { skipped: true }
  }

  if (options.reset) {
    payload.logger.info('Removing existing content…')
    for (const collection of CONTENT_COLLECTIONS) {
      await payload.delete({
        collection,
        where: { id: { exists: true } },
        overrideAccess: true,
        context,
      })
    }
  }

  const upload = async (svg: string, name: string, alt: string) => {
    const data = await sharp(Buffer.from(svg)).webp({ quality: 88 }).toBuffer()
    return payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype: 'image/webp', name: `${name}.webp`, size: data.length },
      overrideAccess: true,
      context,
    })
  }

  payload.logger.info('Creating images…')
  const [heroImage, studioImage, shareImage] = await Promise.all([
    upload(
      heroSvg(),
      'hero-washing-line',
      'Tiny bodysuits, a sleepsuit and socks hanging on a washing line',
    ),
    upload(studioSvg(), 'our-studio', 'A neat stack of folded baby clothes next to a potted plant'),
    upload(
      shareImageSvg('Little Nest', 'Soft, organic clothing for little ones'),
      'share-image',
      'Little Nest',
    ),
  ])

  payload.logger.info('Creating categories…')
  const categories: Record<string, number> = {}
  for (const [index, category] of seedCategories.entries()) {
    const image = await upload(
      categorySvg(
        category.art.garment,
        category.art.color,
        category.art.background,
        category.art.pattern,
      ),
      `category-${category.slug}`,
      category.title,
    )
    const doc = await payload.create({
      collection: 'categories',
      data: {
        title: category.title,
        slug: category.slug,
        description: category.description,
        image: image.id,
        sortOrder: index,
      },
      overrideAccess: true,
      context,
    })
    categories[category.slug] = doc.id
  }

  payload.logger.info('Creating products…')
  const products: Record<string, number> = {}
  for (const product of seedProducts) {
    const { art } = product
    const [front, detail] = await Promise.all([
      upload(
        garmentSvg({
          garment: art.garment,
          color: art.color,
          background: art.background,
          pattern: art.pattern,
        }),
        `${product.slug}-1`,
        `${product.title} in ${product.color}`,
      ),
      upload(
        garmentSvg({
          garment: art.garment,
          color: art.color,
          background: art.altBackground,
          pattern: art.pattern,
          variant: 'detail',
        }),
        `${product.slug}-2`,
        `${product.title} in ${product.color}, detail`,
      ),
    ])
    const doc = await payload.create({
      collection: 'products',
      data: {
        title: product.title,
        slug: product.slug,
        status: 'active',
        images: [front.id, detail.id],
        shortDescription: product.shortDescription,
        description: richText(...product.description.map((paragraph) => p(paragraph))),
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        variants: product.sizes.map(([size, stock]) => ({ size, stock })),
        color: product.color,
        material: product.material,
        features: product.features.map((text) => ({ text })),
        careInstructions: product.care,
        categories: [categories[product.category]!],
        badge: product.badge,
        featured: Boolean(product.featured),
      },
      overrideAccess: true,
      context,
    })
    products[product.slug] = doc.id
  }

  // Link a few complementary items together.
  await payload.update({
    collection: 'products',
    id: products['organic-cotton-bodysuit-oat']!,
    data: {
      relatedProducts: [
        products['cord-dungaree-romper-blue']!,
        products['chunky-knit-cardigan-cream']!,
        products['pom-pom-beanie-sage']!,
        products['stripy-socks-3-pack']!,
      ],
    },
    overrideAccess: true,
    context,
  })

  payload.logger.info('Creating pages…')
  const createPage = async (title: string, slug: string, layout: Layout, description?: string) =>
    payload.create({
      collection: 'pages',
      data: {
        title,
        slug,
        _status: 'published',
        layout,
        meta: description ? { description } : undefined,
      },
      overrideAccess: true,
      context,
    })

  const about = await createPage(
    'Our story',
    'about',
    [
      {
        blockType: 'mediaText',
        image: studioImage.id,
        eyebrow: 'Our story',
        heading: 'Made slowly, for the people who matter most',
        imagePosition: 'left',
        theme: 'sage',
        content: richText(
          p(
            'Little Nest started at a kitchen table with a simple wish: baby clothes that feel as gentle as a hug, last long enough to be handed down, and are kind to the planet our children will inherit.',
          ),
          p(
            'Today we work with a small group of certified mills and family-run workshops, choosing organic cotton, safe dyes and timeless designs over fast trends.',
          ),
        ),
      },
      {
        blockType: 'featureList',
        heading: 'What we believe in',
        items: [
          {
            icon: 'leaf',
            title: 'Certified organic',
            text: 'GOTS-certified cotton, grown without harmful chemicals.',
          },
          {
            icon: 'heart',
            title: 'Gentle on skin',
            text: 'Soft seams, tag-free labels and nickel-free snaps.',
          },
          {
            icon: 'recycle',
            title: 'Made to last',
            text: 'Durable fabrics designed to be passed down.',
          },
          {
            icon: 'shield',
            title: 'Fairly made',
            text: 'We know and visit every workshop we work with.',
          },
        ],
      },
      {
        blockType: 'cta',
        heading: 'Come and visit our little shop',
        text: 'Feel the fabrics in person, get help with sizing, or pick up a gift wrapped by hand.',
        theme: 'blush',
        links: [{ link: custom('Find us', '/contact', 'primary') }],
      },
    ],
    'The story behind Little Nest: organic, fairly made baby clothing designed to be handed down.',
  )

  const faq = await createPage(
    'FAQ',
    'faq',
    [
      {
        blockType: 'faq',
        heading: 'Frequently asked questions',
        items: [
          {
            question: 'How do your sizes run?',
            answer: richText(
              p(
                'Our clothes are true to size with a little room to grow. If your baby is between sizes, we recommend sizing up. See our ',
                link('size guide', '/size-guide'),
                ' for measurements.',
              ),
            ),
          },
          {
            question: 'When will my order arrive?',
            answer: richText(
              p(
                'Orders ship within one business day and usually arrive in 2–5 business days. You will receive a tracking link by email as soon as your parcel is on its way.',
              ),
            ),
          },
          {
            question: 'Can I return or exchange an item?',
            answer: richText(
              p(
                'Yes — unworn items with their labels can be returned within 30 days. Read our ',
                link('shipping & returns policy', '/shipping-returns'),
                ' for details.',
              ),
            ),
          },
          {
            question: 'Are your clothes safe for sensitive skin?',
            answer: richText(
              p(
                'Our cotton is GOTS-certified organic and dyed without harmful substances. We avoid scratchy tags and use nickel-free snaps.',
              ),
            ),
          },
          {
            question: 'Do you offer gift wrapping?',
            answer: richText(
              p(
                'Every order is wrapped in tissue paper. For a gift note, just mention it in a message to us after ordering and we’ll add a handwritten card.',
              ),
            ),
          },
        ],
      },
      {
        blockType: 'cta',
        heading: 'Still have a question?',
        text: 'We’re real people and we love to help.',
        theme: 'sky',
        links: [{ link: custom('Contact us', '/contact', 'primary') }],
      },
    ],
    'Answers to common questions about sizing, shipping, returns and our materials.',
  )

  const shipping = await createPage(
    'Shipping & returns',
    'shipping-returns',
    [
      {
        blockType: 'content',
        width: 'narrow',
        content: richText(
          h('h2', 'Shipping'),
          p(
            'We pack every order by hand in our studio and ship within one business day (Monday to Friday).',
          ),
          ul(
            [bold('Standard shipping: '), 'flat rate, delivered in 2–5 business days.'],
            [
              bold('Free shipping '),
              'on all orders over the free-shipping amount shown at checkout.',
            ],
            ['You will receive a tracking number by email as soon as your order ships.'],
          ),
          h('h2', 'Returns & exchanges'),
          p(
            'If something isn’t quite right, you can return unworn, unwashed items with their labels within 30 days of delivery for a full refund or an exchange.',
          ),
          ul(
            ['Email us with your order number to start a return.'],
            [
              'Refunds are made to your original payment method within 5 business days of receiving your return.',
            ],
            ['For hygiene reasons, socks and swaddles can only be returned unopened.'],
          ),
          p(bold('Please review and adapt this policy to your own business before going live.')),
        ),
      },
    ],
    'Delivery times, shipping costs and our 30-day returns policy.',
  )

  const sizeGuide = await createPage(
    'Size guide',
    'size-guide',
    [
      {
        blockType: 'table',
        heading: 'Baby clothing sizes',
        caption:
          'Measurements are a guide. If your little one is between sizes, we recommend choosing the larger size.',
        columns: [{ label: 'Size' }, { label: 'Age' }, { label: 'Height' }, { label: 'Weight' }],
        rows: [
          ['Newborn', 'Up to 1 month', 'Up to 56 cm / 22"', 'Up to 4.5 kg / 10 lb'],
          ['0–3 months', '0–3 months', '56–62 cm / 22–24"', '4.5–6 kg / 10–13 lb'],
          ['3–6 months', '3–6 months', '62–68 cm / 24–27"', '6–8 kg / 13–17 lb'],
          ['6–12 months', '6–12 months', '68–80 cm / 27–31"', '8–10 kg / 17–22 lb'],
          ['12–18 months', '12–18 months', '80–86 cm / 31–34"', '10–11.5 kg / 22–25 lb'],
          ['18–24 months', '18–24 months', '86–92 cm / 34–36"', '11.5–13 kg / 25–29 lb'],
          ['2–3 years', '2–3 years', '92–98 cm / 36–39"', '13–15 kg / 29–33 lb'],
        ].map((cells) => ({ cells: cells.map((value) => ({ value })) })),
      },
      {
        blockType: 'content',
        width: 'narrow',
        content: richText(
          h('h3', 'How to measure'),
          p(
            bold('Height: '),
            'lay your baby on a flat surface and measure from the top of the head to the heel.',
          ),
          p(bold('Weight: '), 'use your most recent check-up weight.'),
        ),
      },
    ],
    'Find the right fit with our baby clothing size chart.',
  )

  const contact = await createPage(
    'Contact',
    'contact',
    [
      {
        blockType: 'contact',
        heading: 'We’d love to hear from you',
        text: 'Questions about sizing, an order or a gift? Send us a message and we’ll reply within one working day.',
        showStoreDetails: true,
      },
    ],
    'Get in touch with Little Nest or visit our shop.',
  )

  const legal = (title: string, slug: string, intro: string) =>
    createPage(title, slug, [
      {
        blockType: 'content',
        width: 'narrow',
        content: richText(
          p(
            bold(
              'This is placeholder text. Replace it with your own policy, ideally reviewed by a legal professional, before launch.',
            ),
          ),
          p(intro),
          h('h2', 'Contact'),
          p('If you have any questions, please ', link('contact us', '/contact'), '.'),
        ),
      },
    ])

  const privacy = await legal(
    'Privacy policy',
    'privacy',
    'We collect the information needed to process your order (your name, email, shipping address and phone number) and, if you subscribe, your email address for our newsletter. Payments are processed by Stripe; we never see or store your card details. We do not sell your data.',
  )
  const terms = await legal(
    'Terms & conditions',
    'terms',
    'These terms apply to purchases made on this website. Prices include applicable taxes unless stated otherwise at checkout. Product colours may vary slightly from how they appear on screen.',
  )

  await createPage(
    'Home',
    'home',
    [
      {
        blockType: 'hero',
        eyebrow: 'New season · Organic cotton',
        heading: 'Soft beginnings for your little one',
        text: 'Gentle, organic clothing for babies and toddlers — made to be loved, washed a hundred times, and handed down.',
        image: heroImage.id,
        theme: 'blush',
        links: [
          { link: custom('Shop new arrivals', '/shop?sort=newest', 'primary') },
          { link: ref('Our story', 'pages', about.id) },
        ].map((item, index) => ({
          link: { ...item.link, appearance: index === 0 ? 'primary' : 'secondary' },
        })),
      },
      {
        blockType: 'featureList',
        items: [
          {
            icon: 'leaf',
            title: 'GOTS organic cotton',
            text: 'Kind to delicate skin and the planet.',
          },
          { icon: 'truck', title: 'Free shipping over $75', text: 'Fast, tracked delivery.' },
          { icon: 'gift', title: 'Wrapped with love', text: 'Every order arrives gift-ready.' },
          {
            icon: 'recycle',
            title: '30-day returns',
            text: 'Easy exchanges if the size isn’t right.',
          },
        ],
      },
      { blockType: 'categoryGrid', heading: 'Shop by category' },
      {
        blockType: 'featuredProducts',
        heading: 'Little favourites',
        text: 'The pieces parents come back for again and again.',
        source: 'featured',
        limit: 8,
        cta: custom('Shop all', '/shop'),
      },
      {
        blockType: 'mediaText',
        image: studioImage.id,
        eyebrow: 'Why Little Nest',
        heading: 'Thoughtfully made, from seed to snap',
        imagePosition: 'right',
        theme: 'sage',
        content: richText(
          p(
            'We choose certified organic cotton, safe dyes and timeless designs that work for every family — and last long enough to be passed on.',
          ),
        ),
        cta: ref('Read our story', 'pages', about.id),
      },
      {
        blockType: 'featuredProducts',
        heading: 'For sweet dreams',
        source: 'category',
        category: categories['sleepwear'],
        limit: 4,
        cta: ref('All sleepwear', 'categories', categories['sleepwear']!),
      },
      {
        blockType: 'testimonials',
        heading: 'Loved by parents',
        items: [
          {
            quote:
              'The softest bodysuits we own. They’ve survived countless washes and still look new.',
            author: 'Hannah',
            detail: 'Mum of two',
            rating: 5,
          },
          {
            quote:
              'Beautiful quality and the parcel arrived wrapped like a present. Perfect baby shower gift.',
            author: 'Marcus',
            detail: 'Proud uncle',
            rating: 5,
          },
          {
            quote: 'The zip sleepsuits have saved our sanity during night feeds. Thank you!',
            author: 'Priya',
            detail: 'New mum',
            rating: 5,
          },
        ],
      },
    ],
    'Soft, organic baby clothing — bodysuits, sleepwear, knitwear and accessories, made to be handed down.',
  )

  payload.logger.info('Configuring navigation and settings…')
  await payload.updateGlobal({
    slug: 'header',
    data: {
      announcement: {
        enabled: true,
        text: 'Free shipping on orders over $75 · Free 30-day returns',
        url: '/shipping-returns',
      },
      navItems: [
        { link: custom('Shop all', '/shop') },
        { link: ref('Bodysuits', 'categories', categories['bodysuits']!) },
        { link: ref('Sleepwear', 'categories', categories['sleepwear']!) },
        { link: ref('Knitwear', 'categories', categories['knitwear']!) },
        { link: ref('Accessories', 'categories', categories['accessories']!) },
        { link: ref('Our story', 'pages', about.id) },
      ],
    },
    overrideAccess: true,
    context,
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      blurb:
        'Soft, organic clothing for little ones — thoughtfully made and designed to be handed down.',
      columns: [
        {
          title: 'Shop',
          links: [
            { link: custom('Shop all', '/shop') },
            ...seedCategories.map((c) => ({
              link: ref(c.title, 'categories', categories[c.slug]!),
            })),
          ],
        },
        {
          title: 'Help',
          links: [
            { link: ref('FAQ', 'pages', faq.id) },
            { link: ref('Shipping & returns', 'pages', shipping.id) },
            { link: ref('Size guide', 'pages', sizeGuide.id) },
            { link: ref('Contact', 'pages', contact.id) },
          ],
        },
        {
          title: 'Little Nest',
          links: [
            { link: ref('Our story', 'pages', about.id) },
            { link: ref('Privacy policy', 'pages', privacy.id) },
            { link: ref('Terms & conditions', 'pages', terms.id) },
          ],
        },
      ],
      newsletter: {
        enabled: true,
        heading: 'Join the nest',
        text: 'New arrivals, restocks and the occasional treat. No spam, ever.',
      },
      legalText: 'All rights reserved.',
    },
    overrideAccess: true,
    context,
  })

  await payload.updateGlobal({
    slug: 'settings',
    data: {
      siteName: 'Little Nest',
      tagline: 'Soft, organic clothing for little ones',
      description:
        'Little Nest makes soft, organic baby clothing — bodysuits, sleepwear, knitwear and accessories designed to be handed down.',
      defaultShareImage: shareImage.id,
      currency: 'USD',
      locale: 'en-US',
      shippingRate: 5.95,
      freeShippingThreshold: 75,
      deliveryEstimate: { min: 2, max: 5 },
      shippingCountries: ['US', 'CA'],
      lowStockThreshold: 3,
      allowPromotionCodes: true,
      productPageNote: 'Free shipping on orders over $75 · Free 30-day returns',
      email: 'hello@example.com',
      phone: '+1 (555) 010-2030',
      address: '12 Willow Lane\nPortland, OR 97201',
      openingHours: [
        { days: 'Mon – Fri', hours: '10:00 – 18:00' },
        { days: 'Saturday', hours: '10:00 – 17:00' },
        { days: 'Sunday', hours: 'Closed' },
      ],
      social: [
        { platform: 'instagram', url: 'https://www.instagram.com/' },
        { platform: 'pinterest', url: 'https://www.pinterest.com/' },
      ],
    },
    overrideAccess: true,
    context,
  })

  if (options.admin) {
    const found = await payload.count({
      collection: 'users',
      where: { email: { equals: options.admin.email } },
      overrideAccess: true,
    })
    if (found.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: options.admin.email,
          password: options.admin.password,
          name: options.admin.name ?? 'Shop admin',
          roles: ['admin'],
        },
        overrideAccess: true,
        context,
      })
      payload.logger.info(`Created admin user ${options.admin.email}`)
    }
  }

  payload.logger.info('Seed complete.')
  return { skipped: false }
}
