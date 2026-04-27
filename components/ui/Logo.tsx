import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 20, text: 18 },
  md: { icon: 28, text: 24 },
  lg: { icon: 40, text: 34 },
};

export function Logo({ className, iconOnly = false, size = 'md' }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="6" cy="16" r="3" fill="#6366f1" />
        <path
          d="M9 16 C14 6, 18 6, 26 11"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M22 8 L26 11 L22 14"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {!iconOnly && (
        <span
          className="font-display font-bold tracking-tight text-white select-none"
          style={{ fontSize: s.text, letterSpacing: '-0.03em' }}
        >
          routr
        </span>
      )}
    </div>
  );
}
