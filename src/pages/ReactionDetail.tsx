import { useEffect, useState } from 'react';
import { Film, Tv, Calendar, Tag, ArrowLeft, Share2, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Reaction = Database['public']['Tables']['reactions']['Row'];

interface ReactionDetailProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function ReactionDetail({ slug, onNavigate }: ReactionDetailProps) {
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error('Error fetching reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMetaTags = (reaction: Reaction) => {
    const title = `${reaction.title} – Jai's Reaction`;
    const description = reaction.reaction_text.slice(0, 150) + '...';
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
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: reaction?.title,
          text: reaction?.reaction_text,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
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
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!reaction) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Reaction not found</h1>
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate('watchlist')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all reactions</span>
        </button>

        <div className="grid md:grid-cols-[300px,1fr] gap-8">
          <div>
            <div className="aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden mb-4 sticky top-8">
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
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {reaction.type}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  {reaction.title}
                </h1>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {user && (
                  <button
                    onClick={() => onNavigate('edit', reaction.slug)}
                    className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(reaction.date_watched)}</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-8">
              <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {reaction.reaction_text}
              </div>
            </div>

            {reaction.tags && reaction.tags.length > 0 && (
              <div className="flex items-start space-x-2">
                <Tag className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex flex-wrap gap-2">
                  {reaction.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-900 text-gray-400 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
