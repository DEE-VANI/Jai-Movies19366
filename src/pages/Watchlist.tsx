import { useEffect, useState } from 'react';
import { Film, Tv, Filter, Search, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Reaction = Database['public']['Tables']['reactions']['Row'];

interface WatchlistProps {
  onNavigate: (page: string, slug?: string) => void;
}

const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Animation',
  'Mystery',
  'Fantasy',
];

export function Watchlist({ onNavigate }: WatchlistProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');
  const [sort, setSort] = useState<'latest' | 'rating'>('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});

  useEffect(() => {
    fetchReactions();
  }, [filter, sort, searchTerm, selectedGenres]);

  const fetchReactions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reactions')
        .select('*');

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (selectedGenres.length > 0) {
        query = query.contains('genres', selectedGenres);
      }

      if (sort === 'latest') {
        query = query.order('date_watched', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      let sorted = data || [];

      if (sort === 'rating') {
        sorted = sorted.sort((a, b) => {
          const aRating = ratings[a.id]?.avg || 0;
          const bRating = ratings[b.id]?.avg || 0;
          return bRating - aRating;
        });
      }

      setReactions(sorted);

      if (sorted.length > 0) {
        fetchRatings(sorted.map((r) => r.id));
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async (reactionIds: string[]) => {
    try {
      const { data } = await supabase
        .from('ratings')
        .select('reaction_id, rating')
        .in('reaction_id', reactionIds);

      const ratingMap: Record<string, { avg: number; count: number }> = {};

      (data || []).forEach((rating) => {
        if (!ratingMap[rating.reaction_id]) {
          ratingMap[rating.reaction_id] = { avg: 0, count: 0 };
        }
        ratingMap[rating.reaction_id].count++;
        ratingMap[rating.reaction_id].avg += rating.rating;
      });

      Object.keys(ratingMap).forEach((id) => {
        ratingMap[id].avg = ratingMap[id].avg / ratingMap[id].count;
      });

      setRatings(ratingMap);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-gray-400">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">All Reviews</h1>

        <div className="space-y-6 mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'latest' | 'rating')}
              className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="latest">Latest</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Type:</span>
            <div className="flex space-x-2">
              {(['all', 'movie', 'series'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === type
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'Series'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-400 block mb-2">Genres:</span>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() =>
                    setSelectedGenres((prev) =>
                      prev.includes(genre)
                        ? prev.filter((g) => g !== genre)
                        : [...prev, genre]
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedGenres.includes(genre)
                      ? 'bg-purple-600/50 text-purple-200 border border-purple-500'
                      : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {reactions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No reviews found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {reactions.map((reaction) => {
              const ratingData = ratings[reaction.id];
              const avgRating = ratingData?.avg || 0;

              return (
                <button
                  key={reaction.id}
                  onClick={() => onNavigate('reaction', reaction.slug)}
                  className="group text-left"
                >
                  <div className="aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden mb-3 hover:ring-2 hover:ring-cyan-500/50 transition-all duration-300 relative">
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

                    {reaction.featured && (
                      <div className="absolute top-2 right-2 bg-pink-600/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-white flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}

                    {avgRating > 0 && (
                      <div className="absolute top-2 left-2 bg-gray-950/80 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-yellow-400">
                        ★ {avgRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {reaction.title}
                  </h3>
                  <p className="text-gray-500 text-xs">{formatDate(reaction.date_watched)}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
