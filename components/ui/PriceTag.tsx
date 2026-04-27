import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

interface PriceTagProps {
  amount: number;
  currency: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
};

export function PriceTag({ amount, currency, size = 'md', className, label }: PriceTagProps) {
  return (
    <div className={cn('flex flex-col items-end', className)}>
      {label && (
        <span className="text-xs text-[#8888aa] mb-0.5">{label}</span>
      )}
      <span
        className={cn(
          'font-mono-price font-bold text-white',
          textSizes[size]
        )}
      >
        {formatPrice(amount, currency)}
      </span>
    </div>
  );
}
