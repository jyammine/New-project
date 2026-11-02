'use client'

import { useEffect } from 'react'

import { useCart } from './CartProvider'

/** Empties the bag once an order has been placed. */
export function ClearCart() {
  const { clear, hydrated } = useCart()
  useEffect(() => {
    if (hydrated) clear()
  }, [hydrated, clear])
  return null
}
