'use client'

import { useRowLabel } from '@payloadcms/ui'

import { sizeLabel } from '@/lib/constants'

export function VariantRowLabel() {
  const { data, rowNumber } = useRowLabel<{ size?: string; stock?: number }>()
  if (!data?.size) return <span>Size {String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
  return (
    <span>
      {sizeLabel(data.size)} · {data.stock ?? 0} in stock
    </span>
  )
}
