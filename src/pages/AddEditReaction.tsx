import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Reaction = Database['public']['Tables']['reactions']['Row'];

interface AddEditReactionProps {
  slug?: string;
  onNavigate: (page: string, slug?: string) => void;
}

export function AddEditReaction({ slug, onNavigate }: AddEditReactionProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie' as 'movie' | 'series',
    poster_url: '',
    reaction_text: '',
    date_watched: new Date().toISOString().split('T')[0],
    tags: '',
  });

  useEffect(() => {
    if (slug) {
      fetchReaction();
    }
  }, [slug]);

  const fetchReaction = async () => {
    if (!slug) return;

    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title,
          type: data.type,
          poster_url: data.poster_url || '',
          reaction_text: data.reaction_text,
          date_watched: data.date_watched,
          tags: data.tags?.join(', ') || '',
        });
      }
    } catch (err) {
      console.error('Error fetching reaction:', err);
      setError('Failed to load reaction');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to add reactions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const reactionData = {
        title: formData.title,
        type: formData.type,
        poster_url: formData.poster_url || null,
        reaction_text: formData.reaction_text,
        date_watched: formData.date_watched,
        tags: tags.length > 0 ? tags : null,
        user_id: user.id,
      };

      if (slug) {
        const { error } = await supabase
          .from('reactions')
          .update({ ...reactionData, updated_at: new Date().toISOString() })
          .eq('slug', slug);

        if (error) throw error;
        onNavigate('reaction', slug);
      } else {
        const newSlug = generateSlug(formData.title);
        const { error } = await supabase
          .from('reactions')
          .insert({ ...reactionData, slug: newSlug });

        if (error) throw error;
        onNavigate('reaction', newSlug);
      }
    } catch (err) {
      console.error('Error saving reaction:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!slug || !confirm('Are you sure you want to delete this reaction?')) return;

    try {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('slug', slug);

      if (error) throw error;
      onNavigate('watchlist');
    } catch (err) {
      console.error('Error deleting reaction:', err);
      setError('Failed to delete reaction');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-400 mb-6">
            You must be signed in to add or edit reactions.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate(slug ? 'reaction' : 'watchlist', slug)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-4xl font-bold text-white mb-8">
          {slug ? 'Edit Reaction' : 'Add New Reaction'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder="Movie or series title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="movie"
                  checked={formData.type === 'movie'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'movie' | 'series' })}
                  className="text-gray-700 focus:ring-gray-700"
                />
                <span className="text-gray-300">Movie</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="series"
                  checked={formData.type === 'series'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'movie' | 'series' })}
                  className="text-gray-700 focus:ring-gray-700"
                />
                <span className="text-gray-300">Series</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="poster_url" className="block text-sm font-medium text-gray-300 mb-2">
              Poster URL
            </label>
            <input
              id="poster_url"
              type="url"
              value={formData.poster_url}
              onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder="https://example.com/poster.jpg"
            />
          </div>

          <div>
            <label htmlFor="date_watched" className="block text-sm font-medium text-gray-300 mb-2">
              Date Watched *
            </label>
            <input
              id="date_watched"
              type="date"
              value={formData.date_watched}
              onChange={(e) => setFormData({ ...formData, date_watched: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>

          <div>
            <label htmlFor="reaction_text" className="block text-sm font-medium text-gray-300 mb-2">
              Your Reaction * (100-150 words recommended)
            </label>
            <textarea
              id="reaction_text"
              value={formData.reaction_text}
              onChange={(e) => setFormData({ ...formData, reaction_text: e.target.value })}
              required
              rows={8}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700 resize-none"
              placeholder="Share your emotional response, the themes that resonated with you, or the impact this story had on you..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Word count: {formData.reaction_text.split(/\s+/).filter(w => w.length > 0).length}
            </p>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder="emotional, thought-provoking, inspiring"
            />
          </div>

          <div className="flex items-center justify-between pt-6">
            <div>
              {slug && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 font-medium rounded-lg transition-colors"
                >
                  Delete Reaction
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : slug ? 'Update Reaction' : 'Add Reaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
