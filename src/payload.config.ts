import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { seoPlugin } from '@payloadcms/plugin-seo'
import {
  AlignFeature,
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Inquiries } from './collections/Inquiries'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Products } from './collections/Products'
import { Subscribers } from './collections/Subscribers'
import { Users } from './collections/Users'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { SiteSettings } from './globals/SiteSettings'
import { ALL_CACHE_TAGS, revalidateTags } from './lib/revalidate'
import { getServerSideURL } from './lib/urls'
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const isProduction = process.env.NODE_ENV === 'production'
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

const secret = process.env.PAYLOAD_SECRET || ''
if (isProduction && !isBuildPhase && secret.length < 32) {
  throw new Error(
    'PAYLOAD_SECRET must be set to a random string of at least 32 characters in production.',
  )
}

const serverURL = getServerSideURL()

const plugins: Plugin[] = [
  seoPlugin({
    generateTitle: ({ doc }) => (doc?.title ? `${doc.title} | Little Nest` : 'Little Nest'),
    generateURL: ({ doc, collectionSlug }) => {
      const slug = doc?.slug as string | undefined
      if (!slug) return serverURL
      if (collectionSlug === 'products') return `${serverURL}/products/${slug}`
      return slug === 'home' ? serverURL : `${serverURL}/${slug}`
    },
  }),
]

if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET,
      config: {
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  )
}

const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'hello@example.com',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'Little Nest',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      },
    })
  : undefined

export default buildConfig({
  serverURL,
  secret,
  telemetry: false,
  cors: [serverURL],
  csrf: [serverURL],
  admin: {
    user: Users.slug,
    // Avoid loading staff avatars from Gravatar (privacy + no third-party requests).
    avatar: 'default',
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · Little Nest admin',
      description: 'Manage the Little Nest shop.',
    },
    components: {
      graphics: {
        Icon: '@/components/admin/Brand#Icon',
        Logo: '@/components/admin/Brand#Logo',
      },
      beforeDashboard: ['@/components/admin/ShopOverview#ShopOverview'],
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  endpoints: [
    {
      // Clears the storefront cache, e.g. after running the seed script or editing the database directly.
      path: '/revalidate',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        revalidateTags(ALL_CACHE_TAGS, req)
        return Response.json({ revalidated: true })
      },
    },
  ],
  collections: [Products, Categories, Orders, Pages, Media, Subscribers, Inquiries, Users],
  globals: [Header, Footer, SiteSettings],
  editor: lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      AlignFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      LinkFeature({ enabledCollections: ['pages', 'products', 'categories'] }),
      BlockquoteFeature(),
      UploadFeature({ collections: { media: { fields: [] } } }),
      HorizontalRuleFeature(),
      InlineToolbarFeature(),
      FixedToolbarFeature(),
    ],
  }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: Number(process.env.DATABASE_POOL_MAX || 10),
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  email,
  sharp,
  plugins,
  upload: {
    limits: { fileSize: 15_000_000 },
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
