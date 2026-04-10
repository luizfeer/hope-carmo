'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', href: '/' as const },
  { id: 'schedule', label: 'Programação', href: '/schedule' as const },
  { id: 'news', label: 'Notícias', href: '/news' as const },
  { id: 'donations', label: 'Apoie', href: '/donations' as const },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const currentPage =
    pathname === '/'
      ? 'home'
      : pathname.startsWith('/schedule')
        ? 'schedule'
        : pathname.startsWith('/news')
          ? 'news'
          : pathname.startsWith('/donations')
            ? 'donations'
            : 'home';

  const goHome = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = (pageId: string) => {
    setIsMenuOpen(false);
    if (pageId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            onClick={goHome}
            className="text-2xl font-black text-white hover:text-orange-400 transition-colors"
          >
            HOPE CARMO
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'text-orange-400'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10">
            <nav className="px-6 py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left text-lg font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-orange-400'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
