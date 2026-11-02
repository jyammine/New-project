import { cn } from '@/components/ui/cn'
import { formatMoney } from '@/lib/money'

type Props = {
  price: number
  compareAtPrice?: number | null
  currency: string
  locale: string
  className?: string
  size?: 'sm' | 'lg'
}

export function Price({ price, compareAtPrice, currency, locale, className, size = 'sm' }: Props) {
  const onSale = typeof compareAtPrice === 'number' && compareAtPrice > price
  return (
    <p
      className={cn(
        'flex items-baseline gap-2',
        size === 'lg' ? 'text-2xl' : 'text-base',
        className,
      )}
    >
      <span className={cn('font-bold', onSale && 'text-sale')}>
        {onSale && <span className="sr-only">Sale price </span>}
        {formatMoney(price, currency, locale)}
      </span>
      {onSale && (
        <span className={cn('text-ink-soft line-through', size === 'lg' ? 'text-lg' : 'text-sm')}>
          <span className="sr-only">Original price </span>
          {formatMoney(compareAtPrice, currency, locale)}
        </span>
      )}
    </p>
  )
}
