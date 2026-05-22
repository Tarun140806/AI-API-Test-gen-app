'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Beaker, History } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Test Runner', icon: Beaker },
    { href: '/history', label: 'History', icon: History },
  ];

  return (
    <nav className="backdrop-blur-md border-b border-border sticky top-0 z-50" style={{ backgroundColor: 'rgb(18 18 26 / 0.8)' }}>
      <div className="max-w-full px-6 py-4 flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-purple-700 rounded-lg flex items-center justify-center">
            <Beaker size={20} className="text-white" />
          </div>
          <span className="font-bold text-foreground group-hover:text-accent transition-colors">
            API Tester
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 ml-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-accent/20 text-accent font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
