import { useEffect, useState } from 'react';
import { Film, Tv } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Reaction = Database['public']['Tables']['reactions']['Row'];

interface HomeProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentReactions();
  }, []);

  const fetchRecentReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .order('date_watched', { ascending: false })
        .limit(6);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Personal Cinema Journal
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A thoughtful collection of emotional reactions to movies and series.
            Not criticism. Not reviews. Just honest reflections.
          </p>
        </div>

        {reactions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No reactions yet.</p>
            <p className="text-gray-500">Start documenting your cinema journey.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-white mb-8">Recent Reactions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reactions.map((reaction) => (
                <button
                  key={reaction.id}
                  onClick={() => onNavigate('reaction', reaction.slug)}
                  className="group bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-gray-700 transition-all duration-300 text-left"
                >
                  <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
                    {reaction.poster_url ? (
                      <img
                        src={reaction.poster_url}
                        alt={reaction.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {reaction.type === 'movie' ? (
                          <Film className="w-16 h-16 text-gray-600" />
                        ) : (
                          <Tv className="w-16 h-16 text-gray-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {reaction.type}
                      </span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(reaction.date_watched)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gray-300 transition-colors">
                      {reaction.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {reaction.reaction_text}
                    </p>
                    {reaction.tags && reaction.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {reaction.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => onNavigate('watchlist')}
                className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                View All Reactions
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
