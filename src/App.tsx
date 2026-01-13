import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Watchlist } from './pages/Watchlist';
import { ReactionDetail } from './pages/ReactionDetail';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { AddEditReaction } from './pages/AddEditReaction';

type Page = 'home' | 'watchlist' | 'reaction' | 'about' | 'login' | 'add' | 'edit';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentSlug, setCurrentSlug] = useState<string>('');

  const navigate = (page: string, slug?: string) => {
    setCurrentPage(page as Page);
    if (slug) {
      setCurrentSlug(slug);
    } else {
      setCurrentSlug('');
    }
    window.scrollTo(0, 0);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-950">
        <Navigation currentPage={currentPage} onNavigate={navigate} />

        {currentPage === 'home' && <Home onNavigate={navigate} />}
        {currentPage === 'watchlist' && <Watchlist onNavigate={navigate} />}
        {currentPage === 'reaction' && <ReactionDetail slug={currentSlug} onNavigate={navigate} />}
        {currentPage === 'about' && <About />}
        {currentPage === 'login' && <Login onNavigate={navigate} />}
        {currentPage === 'add' && <AddEditReaction onNavigate={navigate} />}
        {currentPage === 'edit' && <AddEditReaction slug={currentSlug} onNavigate={navigate} />}
      </div>
    </AuthProvider>
  );
}

export default App;
