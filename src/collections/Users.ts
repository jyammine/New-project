import type { CollectionConfig } from 'payload'

import { adminOnly, adminOnlyField, isAdminRequest } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff member', plural: 'Staff' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'roles', 'updatedAt'],
    group: 'Settings',
  },
  auth: {
    tokenExpiration: 60 * 60 * 12, // 12 hours
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minutes
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: adminOnly,
    delete: adminOnly,
    read: ({ req }) => {
      if (!req.user) return false
      if (isAdminRequest(req)) return true
      return { id: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (isAdminRequest(req)) return true
      return { id: { equals: req.user.id } }
    },
  },
  hooks: {
    beforeChange: [
      // The very first account created through /admin becomes an administrator.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        if (totalDocs === 0) return { ...data, roles: ['admin'] }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      saveToJWT: true,
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        create: adminOnlyField,
        update: adminOnlyField,
      },
      admin: {
        description:
          'Administrators manage staff accounts and shop settings. Editors manage products, pages and orders.',
      },
    },
  ],
  timestamps: true,
}
