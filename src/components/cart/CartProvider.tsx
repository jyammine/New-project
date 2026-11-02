'use client'

import { usePathname } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

import { type CartItem, cartCount, cartSubtotal } from '@/lib/cart'
import { formatMoney } from '@/lib/money'

import {
  dispatchCart,
  getCartSnapshot,
  getServerCartSnapshot,
  hydratedStore,
  subscribeToCart,
} from './cart-store'

export type ShopConfig = {
  currency: string
  locale: string
  shippingRate: number
  freeShippingThreshold: number | null
  checkoutEnabled: boolean
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  /** False during the server render and hydration, before the saved cart is read. */
  hydrated: boolean
  isOpen: boolean
  config: ShopConfig
  open: () => void
  close: () => void
  addItem: (item: CartItem) => void
  setQuantity: (productId: number, variantId: string, quantity: number) => void
  removeItem: (productId: number, variantId: string) => void
  replaceItems: (items: CartItem[]) => void
  clear: () => void
  format: (amount: number) => string
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({
  children,
  config,
}: {
  children: React.ReactNode
  config: ShopConfig
}) {
  const items = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot)
  const hydrated = useSyncExternalStore(
    hydratedStore.subscribe,
    hydratedStore.getSnapshot,
    hydratedStore.getServerSnapshot,
  )
  const pathname = usePathname()
  // The drawer is tied to the page it was opened on, so it closes itself on navigation.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const isOpen = openOn !== null && openOn === pathname

  const open = useCallback(() => setOpenOn(pathname), [pathname])
  const close = useCallback(() => setOpenOn(null), [])
  const addItem = useCallback(
    (item: CartItem) => {
      dispatchCart({ type: 'add', item })
      setOpenOn(pathname)
    },
    [pathname],
  )
  const setQuantity = useCallback(
    (productId: number, variantId: string, quantity: number) =>
      dispatchCart({ type: 'setQuantity', productId, variantId, quantity }),
    [],
  )
  const removeItem = useCallback(
    (productId: number, variantId: string) =>
      dispatchCart({ type: 'remove', productId, variantId }),
    [],
  )
  const replaceItems = useCallback(
    (next: CartItem[]) => dispatchCart({ type: 'replace', items: next }),
    [],
  )
  const clear = useCallback(() => dispatchCart({ type: 'clear' }), [])
  const format = useCallback(
    (amount: number) => formatMoney(amount, config.currency, config.locale),
    [config.currency, config.locale],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      subtotal: cartSubtotal(items),
      hydrated,
      isOpen,
      config,
      open,
      close,
      addItem,
      setQuantity,
      removeItem,
      replaceItems,
      clear,
      format,
    }),
    [
      items,
      hydrated,
      isOpen,
      config,
      open,
      close,
      addItem,
      setQuantity,
      removeItem,
      replaceItems,
      clear,
      format,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}
