'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AirlineLogoProps {
  carrierCode: string;
  carrierName?: string;
  size?: number;
  className?: string;
}

export function AirlineLogo({ carrierCode, carrierName, size = 24, className }: AirlineLogoProps) {
  const [error, setError] = useState(false);
  const src = `https://pics.avs.io/${size * 2}/${size * 2}/${carrierCode}.png`;

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded bg-[#1a1a24] text-[#8888aa] font-mono text-xs font-bold',
          className
        )}
        style={{ width: size, height: size }}
        title={carrierName ?? carrierCode}
      >
        {carrierCode.slice(0, 2)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={carrierName ?? carrierCode}
      width={size}
      height={size}
      className={cn('rounded object-contain', className)}
      onError={() => setError(true)}
      unoptimized
    />
  );
}
