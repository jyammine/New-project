'use client'

import { type CartAction, type CartItem, cartReducer, sanitizeCartItems } from '@/lib/cart'
import { CART_STORAGE_KEY } from '@/lib/constants'

/**
 * A tiny external store for the cart, persisted to localStorage and synced across tabs.
 * Used with `useSyncExternalStore` so the server render and hydration stay consistent.
 */

const EMPTY: CartItem[] = []
const listeners = new Set<() => void>()
let cache: CartItem[] | null = null

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    return sanitizeCartItems(raw ? JSON.parse(raw) : [])
  } catch {
    // Storage may be unavailable (private mode) or contain invalid JSON.
    return []
  }
}

const notify = () => listeners.forEach((listener) => listener())

export function getCartSnapshot(): CartItem[] {
  if (cache === null) cache = readStorage()
  return cache
}

export const getServerCartSnapshot = (): CartItem[] => EMPTY

export function subscribeToCart(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CART_STORAGE_KEY) return
    cache = readStorage()
    notify()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function dispatchCart(action: CartAction): void {
  const next = cartReducer({ items: getCartSnapshot() }, action).items
  if (next === cache) return
  cache = next
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Ignore quota or availability errors; the cart still works for this page view.
  }
  notify()
}

const noopSubscribe = () => () => {}
export const hydratedStore = {
  subscribe: noopSubscribe,
  getSnapshot: () => true,
  getServerSnapshot: () => false,
}
