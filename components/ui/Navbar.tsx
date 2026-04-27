'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Routr home">
          <Logo size="md" />
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              'text-sm font-medium transition-colors duration-150',
              pathname === '/'
                ? 'text-white'
                : 'text-[#8888aa] hover:text-white'
            )}
          >
            Search
          </Link>
          <Link
            href="/calendar"
            className={cn(
              'text-sm font-medium transition-colors duration-150',
              pathname === '/calendar'
                ? 'text-white'
                : 'text-[#8888aa] hover:text-white'
            )}
          >
            Calendar
          </Link>
        </div>
      </nav>
    </header>
  );
}
