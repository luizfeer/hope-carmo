import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Videos from './components/Videos';
import Schedule from './components/Schedule';
import Donations from './components/Donations';
import Footer from './components/Footer';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Escutar mudanças no hash da URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['home', 'schedule', 'news', 'donations'].includes(hash)) {
        setCurrentPage(hash);
        
        // Se for home, fazer scroll suave para o topo
        if (hash === 'home') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
    };

    // Verificar hash inicial
    handleHashChange();

    // Escutar mudanças no hash
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero />
            <About />
            <News />
            <Videos />
            <Schedule />
          </>
        );
      case 'schedule':
        return <Schedule />;
      case 'news':
        return <News />;
      case 'donations':
        return <Donations />;
      default:
        return (
          <>
            <Hero />
            <About />
            <News />
            <Videos />
            <Schedule />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header currentPage={currentPage} />
      {renderPage()}
      <Footer />
    </div>
  );
}

export default App;