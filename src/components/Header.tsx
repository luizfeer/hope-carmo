import React from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'schedule', label: 'Programação' },
    { id: 'news', label: 'Notícias' },
    { id: 'donations', label: 'Apoie' },
  ];

  const handleNavigation = (pageId: string) => {
    window.location.hash = pageId;
    setIsMenuOpen(false);
    
    // Se for home, fazer scroll suave para o topo
    if (pageId === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button 
            onClick={() => handleNavigation('home')}
            className="text-2xl font-black text-white hover:text-orange-400 transition-colors"
          >
            HOPE CARMO
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'text-orange-400'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10">
            <nav className="px-6 py-4 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`block w-full text-left text-lg font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-orange-400'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;