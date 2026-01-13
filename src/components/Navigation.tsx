import { Film, LogIn, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-gray-950 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-xl font-semibold text-white hover:text-gray-300 transition-colors"
          >
            <Film className="w-6 h-6" />
            <span>Jai – Movies Reaction</span>
          </button>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'home'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('watchlist')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'watchlist'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Reactions
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'about'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              About
            </button>

            {user ? (
              <>
                <button
                  onClick={() => onNavigate('add')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center space-x-1 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
