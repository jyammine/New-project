'use client'

import { Minus, Plus } from 'lucide-react'

import { MAX_QTY_PER_LINE } from '@/lib/constants'

type Props = {
  value: number
  onChange: (value: number) => void
  max?: number
  label: string
  size?: 'sm' | 'md'
}

export function QuantityStepper({
  value,
  onChange,
  max = MAX_QTY_PER_LINE,
  label,
  size = 'md',
}: Props) {
  const limit = Math.max(1, Math.min(max, MAX_QTY_PER_LINE))
  const button =
    size === 'sm'
      ? 'flex size-8 items-center justify-center rounded-full hover:bg-sand disabled:opacity-40'
      : 'flex size-11 items-center justify-center rounded-full hover:bg-sand disabled:opacity-40'
  return (
    <div
      className="inline-flex items-center rounded-full border border-line bg-white"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={button}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="min-w-8 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={value >= limit}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  )
}
