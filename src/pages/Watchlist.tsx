import { useEffect, useState } from 'react';
import { Film, Tv, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Reaction = Database['public']['Tables']['reactions']['Row'];

interface WatchlistProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function Watchlist({ onNavigate }: WatchlistProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');

  useEffect(() => {
    fetchReactions();
  }, [filter]);

  const fetchReactions = async () => {
    try {
      let query = supabase
        .from('reactions')
        .select('*')
        .order('date_watched', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-gray-400">Loading reactions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 sm:mb-0">
            All Reactions
          </h1>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('movie')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'movie'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setFilter('series')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'series'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              Series
            </button>
          </div>
        </div>

        {reactions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No {filter !== 'all' ? filter : ''} reactions found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {reactions.map((reaction) => (
              <button
                key={reaction.id}
                onClick={() => onNavigate('reaction', reaction.slug)}
                className="group text-left"
              >
                <div className="aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden mb-3 hover:ring-2 hover:ring-gray-700 transition-all duration-300">
                  {reaction.poster_url ? (
                    <img
                      src={reaction.poster_url}
                      alt={reaction.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {reaction.type === 'movie' ? (
                        <Film className="w-12 h-12 text-gray-600" />
                      ) : (
                        <Tv className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                  )}
                </div>
                <h3 className="text-white font-medium text-sm mb-1 group-hover:text-gray-300 transition-colors line-clamp-2">
                  {reaction.title}
                </h3>
                <p className="text-gray-500 text-xs">
                  {formatDate(reaction.date_watched)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
