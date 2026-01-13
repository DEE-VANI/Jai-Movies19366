import { useEffect, useState } from 'react';
import { Film, Tv, Calendar, Tag, ArrowLeft, Share2, Edit, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { StarRating } from '../components/StarRating';
import { ImageGallery } from '../components/ImageGallery';
import type { Database } from '../lib/database.types';

type Reaction = Database['public']['Tables']['reactions']['Row'];

interface ReactionDetailProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function ReactionDetail({ slug, onNavigate }: ReactionDetailProps) {
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState<number | undefined>();
  const [ratingLoading, setRatingLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReaction();
  }, [slug]);

  useEffect(() => {
    if (reaction) {
      updateMetaTags(reaction);
    }
  }, [reaction]);

  const fetchReaction = async () => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      setReaction(data);

      if (data) {
        fetchRatings(data.id);
      }
    } catch (error) {
      console.error('Error fetching reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async (reactionId: string) => {
    try {
      const { data } = await supabase
        .from('ratings')
        .select('rating, user_id')
        .eq('reaction_id', reactionId);

      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(avg);
        setTotalRatings(data.length);

        if (user) {
          const myRating = data.find((r) => r.user_id === user.id);
          setUserRating(myRating?.rating);
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleRate = async (rating: number) => {
    if (!reaction || !user) return;

    setRatingLoading(true);
    try {
      if (userRating) {
        const { error } = await supabase
          .from('ratings')
          .update({ rating })
          .eq('reaction_id', reaction.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ratings')
          .insert({
            reaction_id: reaction.id,
            rating,
            user_id: user.id,
          });

        if (error) throw error;
      }

      setUserRating(rating);
      fetchRatings(reaction.id);
    } catch (error) {
      console.error('Error rating:', error);
    } finally {
      setRatingLoading(false);
    }
  };

  const updateMetaTags = (reaction: Reaction) => {
    const title = `${reaction.title} – JAI Movies Review`;
    const description = reaction.short_review || reaction.reaction_text.slice(0, 150) + '...';
    const url = window.location.href;

    document.title = title;

    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', 'article');
    if (reaction.poster_url) {
      updateMetaTag('og:image', reaction.poster_url);
    }

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    if (reaction.poster_url) {
      updateMetaTag('twitter:image', reaction.poster_url);
    }
  };

  const updateMetaTag = (property: string, content: string) => {
    let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!element) {
      element = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
    }
    if (!element) {
      element = document.createElement('meta');
      if (property.startsWith('og:')) {
        element.setAttribute('property', property);
      } else {
        element.setAttribute('name', property);
      }
      document.head.appendChild(element);
    }
    element.content = content;
  };

  const handleShare = async () => {
    if (!reaction) return;

    const text = `Watched "${reaction.title}" - ${reaction.short_review || reaction.reaction_text.slice(0, 100)}... Check out my full review on JAI Movies!`;
    const url = window.location.href;
    const twitterHandle = 'JaiMovies19366';

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=${twitterHandle}`;

    window.open(twitterUrl, 'twitter-share', 'width=550,height=420');
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
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!reaction) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Review not found</h1>
          <button
            onClick={() => onNavigate('home')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  const images = reaction.image_urls && reaction.image_urls.length > 0 ? reaction.image_urls : [];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate('watchlist')}
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to reviews</span>
        </button>

        <div className="grid md:grid-cols-[300px,1fr] gap-8 mb-12">
          <div>
            <div className="aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden mb-6 sticky top-8">
              {reaction.poster_url ? (
                <img
                  src={reaction.poster_url}
                  alt={reaction.title}
                  className="w-full h-full object-cover"
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

            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-lg p-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Rating</p>
                <StarRating
                  averageRating={averageRating}
                  totalRatings={totalRatings}
                  userRating={userRating}
                  onRate={user ? handleRate : undefined}
                  disabled={ratingLoading}
                />
              </div>

              {reaction.genres && reaction.genres.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Genres</p>
                  <div className="flex flex-wrap gap-1">
                    {reaction.genres.map((genre) => (
                      <span
                        key={genre}
                        className="text-xs px-2 py-1 bg-purple-600/30 text-purple-300 rounded"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-cyan-400 uppercase tracking-wide">
                    {reaction.type}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">{reaction.title}</h1>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500/50 text-cyan-400 rounded-lg transition-colors"
                  title="Share on Twitter"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {user && (
                  <button
                    onClick={() => onNavigate('edit', reaction.slug)}
                    className="p-2 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500/50 text-cyan-400 rounded-lg transition-colors"
                    title="Edit review"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6 mb-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(reaction.date_watched)}</span>
              </div>
            </div>

            {reaction.short_review && (
              <div className="bg-gradient-to-r from-cyan-600/10 to-purple-600/10 border border-cyan-600/20 rounded-lg p-4 mb-8">
                <p className="text-gray-300 text-base italic leading-relaxed">
                  "{reaction.short_review}"
                </p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Full Review</h2>
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {reaction.reaction_text}
                </div>
              </div>
            </div>

            {reaction.tags && reaction.tags.length > 0 && (
              <div className="flex items-start space-x-2 mb-8">
                <Tag className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex flex-wrap gap-2">
                  {reaction.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-900/50 border border-gray-800 text-gray-400 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <div className="border-t border-gray-800 pt-12">
            <h2 className="text-xl font-semibold text-white mb-6">Gallery</h2>
            <ImageGallery images={images} />
          </div>
        )}

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex items-center space-x-2 text-gray-400 mb-4">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Did you watch this? Share your thoughts on Twitter.</span>
          </div>
          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium rounded-lg transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on Twitter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
