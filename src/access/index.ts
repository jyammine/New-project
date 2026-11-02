import type { Access, FieldAccess, PayloadRequest } from 'payload'

type Role = 'admin' | 'editor'

const hasRole = (req: PayloadRequest, role: Role): boolean => {
  const roles = (req.user as { roles?: Role[] } | null)?.roles
  return Array.isArray(roles) && roles.includes(role)
}

export const isAdminRequest = (req: PayloadRequest): boolean => hasRole(req, 'admin')

/** Anyone, including anonymous visitors. */
export const anyone: Access = () => true

/** Nobody through the API. Server code uses `overrideAccess: true`. */
export const nobody: Access = () => false

/** Any logged-in staff member (admin or editor). */
export const staff: Access = ({ req }) => Boolean(req.user)

export const adminOnly: Access = ({ req }) => isAdminRequest(req)

export const adminOnlyField: FieldAccess = ({ req }) => isAdminRequest(req)

/** Staff see everything; the public only sees published documents (Payload drafts). */
export const publishedOrStaff: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}

/** Staff see everything; the public only sees products marked as active. */
export const activeProductsOrStaff: Access = ({ req }) => {
  if (req.user) return true
  return { status: { equals: 'active' } }
}
