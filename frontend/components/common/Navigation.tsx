'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface NavLink {
  href: string;
  label: string;
}

interface NavigationProps {
  links: NavLink[];
  className?: string;
  mobile?: boolean;
}

export default function Navigation({ links, className = '', mobile = false }: NavigationProps) {
  const pathname = usePathname();

  const baseClasses = mobile
    ? 'block px-2 py-2 rounded-md transition'
    : 'px-3 py-2 rounded-md transition';

  return (
    <nav className={className}>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              baseClasses,
              isActive
                ? mobile
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500 text-white'
                : mobile
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-700 hover:text-blue-600'
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
