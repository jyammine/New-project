import type { Metadata } from 'next'

import { CartView } from '@/components/cart/CartView'

export const metadata: Metadata = {
  title: 'Your bag',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ checkout?: string }> }

export default async function CartPage({ searchParams }: Props) {
  const { checkout } = await searchParams
  return (
    <div className="container-page pt-10 sm:pt-14">
      <h1 className="mb-8 text-4xl sm:text-5xl">Your bag</h1>
      <CartView cancelled={checkout === 'cancelled'} />
    </div>
  )
}
