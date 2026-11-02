import type { Garment, Pattern } from './illustrations'

type Size = 'nb' | '0-3m' | '3-6m' | '6-12m' | '12-18m' | '18-24m' | '2-3y' | '3-4y' | 'os'

export type SeedProduct = {
  title: string
  slug: string
  category: string
  price: number
  compareAtPrice?: number
  color: string
  material: string
  shortDescription: string
  description: string[]
  features: string[]
  care: string
  badge?: 'new' | 'bestseller' | 'limited' | 'organic'
  featured?: boolean
  sizes: Array<[Size, number]>
  art: {
    garment: Garment
    color: string
    background: string
    pattern?: Pattern
    altBackground: string
  }
}

const babySizes = (stock: number[]): Array<[Size, number]> =>
  (['nb', '0-3m', '3-6m', '6-12m', '12-18m'] as Size[]).map((size, i) => [size, stock[i] ?? 0])

const GENTLE_CARE =
  'Machine wash cold (30°C) with similar colours. Tumble dry low. Do not bleach. Iron on low.'

export const seedProducts: SeedProduct[] = [
  {
    title: 'Organic Cotton Bodysuit',
    slug: 'organic-cotton-bodysuit-oat',
    category: 'bodysuits',
    price: 22,
    color: 'Oat',
    material: '100% GOTS-certified organic cotton',
    shortDescription:
      'Our everyday short-sleeve bodysuit with an envelope neckline for easy dressing.',
    description: [
      'The bodysuit every new parent reaches for first. Made from buttery-soft organic cotton jersey that gets softer with every wash.',
      'Envelope shoulders stretch wide so you can pull it down over the body after a messy moment, and nickel-free snaps make nappy changes quick.',
    ],
    features: ['Envelope neckline', 'Nickel-free snap fastening', 'Tag-free comfort label'],
    care: GENTLE_CARE,
    badge: 'bestseller',
    featured: true,
    sizes: babySizes([12, 18, 20, 14, 8]),
    art: { garment: 'bodysuit', color: '#efe4d6', background: '#f4ede4', altBackground: '#dde7d6' },
  },
  {
    title: 'Ribbed Long-Sleeve Bodysuit',
    slug: 'ribbed-long-sleeve-bodysuit-sage',
    category: 'bodysuits',
    price: 24,
    color: 'Sage',
    material: '95% organic cotton, 5% elastane rib',
    shortDescription:
      'A stretchy rib bodysuit that layers beautifully under cardigans and dungarees.',
    description: [
      'Fine rib knit with just enough stretch to grow with your baby. Long sleeves with soft cuffs keep little arms cosy on cooler days.',
    ],
    features: ['Stretchy rib knit', 'Envelope neckline', 'Three-snap crotch'],
    care: GENTLE_CARE,
    badge: 'new',
    featured: true,
    sizes: babySizes([6, 10, 12, 9, 2]),
    art: {
      garment: 'bodysuitLong',
      color: '#c9d8c1',
      background: '#dde7d6',
      pattern: 'rib',
      altBackground: '#f4ede4',
    },
  },
  {
    title: 'Polka Dot Bodysuit',
    slug: 'polka-dot-bodysuit-cloud',
    category: 'bodysuits',
    price: 22,
    compareAtPrice: 28,
    color: 'Cloud with dots',
    material: '100% organic cotton jersey',
    shortDescription: 'Playful little dots on our softest jersey — now on sale while stocks last.',
    description: [
      'The classic short-sleeve bodysuit with a sweet all-over dot print, printed with water-based inks.',
    ],
    features: ['Water-based print', 'Envelope neckline', 'Nickel-free snaps'],
    care: GENTLE_CARE,
    sizes: babySizes([0, 4, 6, 3, 1]),
    art: {
      garment: 'bodysuit',
      color: '#fbf7f2',
      background: '#d9e7f1',
      pattern: 'dots',
      altBackground: '#f8edc9',
    },
  },
  {
    title: 'Frill Sleeve Romper',
    slug: 'frill-sleeve-romper-blush',
    category: 'bodysuits',
    price: 36,
    color: 'Blush',
    material: '100% organic cotton muslin',
    shortDescription:
      'Breezy double-gauze romper with frilled sleeves for warm days and special occasions.',
    description: [
      'Light, breathable double-gauze muslin keeps babies comfortable in warm weather. Finished with fluttery frill sleeves and wooden buttons.',
    ],
    features: ['Double-gauze muslin', 'Coconut-shell buttons', 'Snap leg opening'],
    care: GENTLE_CARE,
    featured: true,
    sizes: babySizes([3, 7, 9, 6, 4]),
    art: { garment: 'romper', color: '#e9b7aa', background: '#f6dad3', altBackground: '#fbf7f2' },
  },
  {
    title: 'Cord Dungaree Romper',
    slug: 'cord-dungaree-romper-blue',
    category: 'bodysuits',
    price: 39,
    color: 'Dusty blue',
    material: '100% organic cotton baby cord',
    shortDescription:
      'Soft baby-cord dungarees with adjustable straps, perfect over a ribbed bodysuit.',
    description: [
      'Our best-loved dungarees are cut from a fine, flexible baby corduroy. Adjustable straps and snaps along the legs make them easy to wear and easy to change.',
    ],
    features: ['Adjustable straps', 'Front bib pocket', 'Snaps along the legs'],
    care: GENTLE_CARE,
    badge: 'organic',
    sizes: babySizes([0, 5, 8, 8, 6]),
    art: {
      garment: 'dungarees',
      color: '#9fb7cf',
      background: '#d9e7f1',
      altBackground: '#f6dad3',
    },
  },
  {
    title: 'Starry Night Zip Sleepsuit',
    slug: 'starry-night-zip-sleepsuit',
    category: 'sleepwear',
    price: 32,
    color: 'Sky with stars',
    material: '100% organic cotton interlock',
    shortDescription: 'A two-way zip sleepsuit made for sleepy 3am changes — no fiddly snaps.',
    description: [
      'Two-way zip opens from the bottom for nappy changes without waking. Fold-over mitts on the smallest sizes stop little scratches.',
    ],
    features: ['Two-way zip with chin guard', 'Fold-over mitts (up to 3 months)', 'Covered feet'],
    care: GENTLE_CARE,
    badge: 'bestseller',
    featured: true,
    sizes: babySizes([10, 14, 16, 12, 6]),
    art: {
      garment: 'sleepsuit',
      color: '#d9e7f1',
      background: '#f8edc9',
      pattern: 'stars',
      altBackground: '#dde7d6',
    },
  },
  {
    title: 'Footed Sleepsuit',
    slug: 'footed-sleepsuit-cream',
    category: 'sleepwear',
    price: 30,
    color: 'Cream',
    material: '100% organic cotton interlock',
    shortDescription: 'The simplest, softest sleepsuit with a neat zip and covered feet.',
    description: ['Made from thick, cosy interlock cotton that keeps its shape wash after wash.'],
    features: ['Full-length zip', 'Covered feet', 'Ribbed cuffs'],
    care: GENTLE_CARE,
    sizes: babySizes([8, 10, 10, 8, 4]),
    art: {
      garment: 'sleepsuit',
      color: '#f3ead9',
      background: '#f6dad3',
      altBackground: '#d9e7f1',
    },
  },
  {
    title: 'Sleeping Bag 2.5 TOG',
    slug: 'sleeping-bag-butter',
    category: 'sleepwear',
    price: 58,
    color: 'Butter',
    material: 'Organic cotton shell, recycled polyester fill',
    shortDescription: 'Snug, safe sleep for cooler nights — no loose blankets needed.',
    description: [
      'Designed for room temperatures between 16–20°C. A long two-way zip makes night changes simple, and the generous shape gives room to kick.',
    ],
    features: ['2.5 TOG for 16–20°C', 'Two-way zip', 'Snap shoulders'],
    care: 'Machine wash at 40°C. Tumble dry low. Shake well after drying.',
    badge: 'new',
    featured: true,
    sizes: [
      ['0-3m', 6],
      ['6-12m', 9],
      ['18-24m', 5],
    ],
    art: {
      garment: 'sleepingBag',
      color: '#f4d98a',
      background: '#f8edc9',
      pattern: 'dots',
      altBackground: '#d9e7f1',
    },
  },
  {
    title: 'Chunky Knit Cardigan',
    slug: 'chunky-knit-cardigan-cream',
    category: 'knitwear',
    price: 48,
    color: 'Cream',
    material: '100% organic cotton knit',
    shortDescription:
      'A heirloom-style knit cardigan with wooden buttons — made to be handed down.',
    description: [
      'Knitted from thick, soft organic cotton yarn that is gentle on sensitive skin. A timeless piece that works with everything.',
    ],
    features: ['Wooden buttons', 'Ribbed cuffs and hem', 'Relaxed fit for layering'],
    care: 'Hand wash cold or machine wash on wool cycle. Dry flat.',
    featured: true,
    sizes: [
      ['3-6m', 5],
      ['6-12m', 6],
      ['12-18m', 4],
      ['18-24m', 3],
      ['2-3y', 2],
    ],
    art: {
      garment: 'cardigan',
      color: '#f3ead9',
      background: '#dde7d6',
      pattern: 'rib',
      altBackground: '#f6dad3',
    },
  },
  {
    title: 'Knitted Bonnet',
    slug: 'knitted-bonnet-blush',
    category: 'knitwear',
    price: 22,
    color: 'Blush',
    material: '100% organic cotton knit',
    shortDescription: 'A sweet knitted bonnet with soft ties that stays put.',
    description: [
      'Gentle on new ears and adorable in photos. Soft ribbon ties fasten under the chin.',
    ],
    features: ['Soft ribbon ties', 'Lightweight knit'],
    care: 'Hand wash cold. Dry flat.',
    badge: 'limited',
    sizes: [
      ['0-3m', 4],
      ['3-6m', 6],
      ['6-12m', 3],
    ],
    art: { garment: 'bonnet', color: '#e9b7aa', background: '#fbf7f2', altBackground: '#f8edc9' },
  },
  {
    title: 'Pom-Pom Beanie',
    slug: 'pom-pom-beanie-sage',
    category: 'accessories',
    price: 18,
    color: 'Sage',
    material: '100% organic cotton rib',
    shortDescription: 'A snug rib beanie with a fluffy pom-pom for chilly walks.',
    description: ['Turn-up cuff for a perfect fit and room to grow.'],
    features: ['Fold-over cuff', 'Removable pom-pom'],
    care: GENTLE_CARE,
    sizes: [
      ['0-3m', 10],
      ['3-6m', 12],
      ['6-12m', 9],
      ['12-18m', 7],
    ],
    art: {
      garment: 'beanie',
      color: '#a9c2a0',
      background: '#f4ede4',
      pattern: 'rib',
      altBackground: '#d9e7f1',
    },
  },
  {
    title: 'Muslin Swaddle Set of 3',
    slug: 'muslin-swaddle-set-botanical',
    category: 'accessories',
    price: 34,
    color: 'Botanical',
    material: '100% organic cotton muslin',
    shortDescription: 'Three large, breathable muslins — swaddle, burp cloth, pram shade and more.',
    description: [
      'Generous 120 × 120 cm squares in our botanical print. Breathable, absorbent and endlessly useful.',
    ],
    features: ['Set of 3', '120 × 120 cm', 'Gets softer with every wash'],
    care: 'Machine wash at 40°C. Tumble dry low.',
    badge: 'organic',
    featured: true,
    sizes: [['os', 25]],
    art: {
      garment: 'swaddle',
      color: '#fbf7f2',
      background: '#dde7d6',
      pattern: 'leaves',
      altBackground: '#f6dad3',
    },
  },
  {
    title: 'Stripy Socks 3-Pack',
    slug: 'stripy-socks-3-pack',
    category: 'accessories',
    price: 14,
    color: 'Butter & cream',
    material: '80% organic cotton, 18% polyamide, 2% elastane',
    shortDescription: 'Socks that actually stay on — with a gentle, non-binding cuff.',
    description: ['Three pairs of soft socks in coordinating stripes and solids.'],
    features: ['Set of 3 pairs', 'Non-binding cuff', 'Reinforced heel and toe'],
    care: GENTLE_CARE,
    sizes: [
      ['0-3m', 20],
      ['3-6m', 18],
      ['6-12m', 15],
      ['12-18m', 10],
    ],
    art: {
      garment: 'socks',
      color: '#f8edc9',
      background: '#d9e7f1',
      pattern: 'stripes',
      altBackground: '#fbf7f2',
    },
  },
  {
    title: 'Soft Leather Booties',
    slug: 'soft-leather-booties-caramel',
    category: 'accessories',
    price: 29,
    color: 'Caramel',
    material: 'Vegetable-tanned leather, suede sole',
    shortDescription: 'Flexible pre-walker booties with a grippy suede sole.',
    description: [
      'Hand-stitched from soft vegetable-tanned leather. Elasticated ankles keep them on wriggly feet while letting toes move naturally.',
    ],
    features: ['Suede non-slip sole', 'Elasticated ankle', 'Hand-stitched'],
    care: 'Wipe clean with a damp cloth. Do not machine wash.',
    sizes: [
      ['0-3m', 3],
      ['3-6m', 5],
      ['6-12m', 4],
      ['12-18m', 2],
    ],
    art: { garment: 'booties', color: '#d9b99b', background: '#f6dad3', altBackground: '#dde7d6' },
  },
]

export const seedCategories = [
  {
    slug: 'bodysuits',
    title: 'Bodysuits & rompers',
    description: 'Everyday essentials in the softest organic cotton — easy on, easy off.',
    art: {
      garment: 'bodysuit' as Garment,
      color: '#fbf7f2',
      background: '#f6dad3',
      pattern: 'dots' as Pattern,
    },
  },
  {
    slug: 'sleepwear',
    title: 'Sleepwear',
    description: 'Sleepsuits and sleeping bags for cosy, safe nights.',
    art: {
      garment: 'sleepsuit' as Garment,
      color: '#d9e7f1',
      background: '#dde7d6',
      pattern: 'stars' as Pattern,
    },
  },
  {
    slug: 'knitwear',
    title: 'Knitwear',
    description: 'Heirloom knits made to be handed down.',
    art: {
      garment: 'cardigan' as Garment,
      color: '#f3ead9',
      background: '#d9e7f1',
      pattern: 'rib' as Pattern,
    },
  },
  {
    slug: 'accessories',
    title: 'Accessories',
    description: 'Hats, socks, booties and muslins — the finishing touches.',
    art: {
      garment: 'beanie' as Garment,
      color: '#e9b7aa',
      background: '#f8edc9',
      pattern: 'rib' as Pattern,
    },
  },
]
