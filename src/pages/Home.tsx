import { useEffect, useState } from 'react';
import { Film, Tv, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Reaction = Database['public']['Tables']['reactions']['Row'];

interface HomeProps {
  onNavigate: (page: string, slug?: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [featured, setFeatured] = useState<Reaction[]>([]);
  const [latest, setLatest] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const [featuredData, latestData] = await Promise.all([
        supabase
          .from('reactions')
          .select('*')
          .eq('featured', true)
          .order('date_watched', { ascending: false })
          .limit(3),
        supabase
          .from('reactions')
          .select('*')
          .order('date_watched', { ascending: false })
          .limit(6),
      ]);

      setFeatured(featuredData.data || []);
      setLatest(latestData.data || []);

      const reactionIds = [
        ...(featuredData.data || []),
        ...(latestData.data || []),
      ].map((r) => r.id);

      if (reactionIds.length > 0) {
        fetchRatings(reactionIds);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
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

  const ReviewCard = ({ reaction }: { reaction: Reaction }) => {
    const ratingData = ratings[reaction.id];
    const avgRating = ratingData?.avg || 0;

    return (
      <button
        onClick={() => onNavigate('reaction', reaction.slug)}
        className="group bg-gray-900/50 backdrop-blur border border-gray-800 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-300"
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
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-wide">
              {reaction.type}
            </span>
            {avgRating > 0 && (
              <span className="text-xs font-semibold text-yellow-400">
                ★ {avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
            {reaction.title}
          </h3>
          {reaction.short_review && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-2">
              {reaction.short_review}
            </p>
          )}
          <p className="text-xs text-gray-500">{formatDate(reaction.date_watched)}</p>
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Movie Reviews
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Honest reactions, emotional insights, and cinematic moments from the films and series that matter.
          </p>
        </div>

        {featured.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center space-x-2 mb-8">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">Featured Reviews</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((review) => (
                <ReviewCard key={review.id} reaction={review} />
              ))}
            </div>
          </section>
        )}

        {latest.length > 0 && (
          <section>
            <div className="flex items-center space-x-2 mb-8">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Latest Reviews</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest.map((review) => (
                <ReviewCard key={review.id} reaction={review} />
              ))}
            </div>
          </section>
        )}

        {featured.length === 0 && latest.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No reviews yet.</p>
            <button
              onClick={() => onNavigate('add')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
            >
              Start with your first review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
