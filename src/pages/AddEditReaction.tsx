import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Reaction = Database['public']['Tables']['reactions']['Row'];

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
    short_review: '',
    reaction_text: '',
    date_watched: new Date().toISOString().split('T')[0],
    genres: [] as string[],
    tags: '',
    image_urls: [] as string[],
    featured: false,
  });

  const [imageInput, setImageInput] = useState('');

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
          short_review: data.short_review || '',
          reaction_text: data.reaction_text,
          date_watched: data.date_watched,
          genres: data.genres || [],
          tags: data.tags?.join(', ') || '',
          image_urls: data.image_urls || [],
          featured: data.featured,
        });
      }
    } catch (err) {
      console.error('Error fetching reaction:', err);
      setError('Failed to load review');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleAddImage = () => {
    if (imageInput.trim() && formData.image_urls.length < 10) {
      setFormData({
        ...formData,
        image_urls: [...formData.image_urls, imageInput.trim()],
      });
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      image_urls: formData.image_urls.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to add reviews');
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
        short_review: formData.short_review || null,
        reaction_text: formData.reaction_text,
        date_watched: formData.date_watched,
        genres: formData.genres.length > 0 ? formData.genres : null,
        tags: tags.length > 0 ? tags : null,
        image_urls: formData.image_urls.length > 0 ? formData.image_urls : null,
        featured: formData.featured,
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
      console.error('Error saving review:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!slug || !confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('slug', slug);

      if (error) throw error;
      onNavigate('watchlist');
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-gray-400 mb-6">You must be signed in to add or edit reviews.</p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
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
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-4xl font-bold text-white mb-8">
          {slug ? 'Edit Review' : 'Add New Review'}
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="Movie or series title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="movie"
                    checked={formData.type === 'movie'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'movie' | 'series' })}
                  />
                  <span className="text-gray-300">Movie</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="series"
                    checked={formData.type === 'series'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'movie' | 'series' })}
                  />
                  <span className="text-gray-300">Series</span>
                </label>
              </div>
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
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="https://example.com/poster.jpg"
            />
          </div>

          <div>
            <label htmlFor="short_review" className="block text-sm font-medium text-gray-300 mb-2">
              Short Review / Summary
            </label>
            <textarea
              id="short_review"
              value={formData.short_review}
              onChange={(e) => setFormData({ ...formData, short_review: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="A brief one-line summary or quote"
            />
          </div>

          <div>
            <label htmlFor="reaction_text" className="block text-sm font-medium text-gray-300 mb-2">
              Full Review * (100-150 words recommended)
            </label>
            <textarea
              id="reaction_text"
              value={formData.reaction_text}
              onChange={(e) => setFormData({ ...formData, reaction_text: e.target.value })}
              required
              rows={8}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Share your emotional response and insights about this film or series..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Word count: {formData.reaction_text.split(/\s+/).filter(w => w.length > 0).length}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      genres: formData.genres.includes(genre)
                        ? formData.genres.filter((g) => g !== genre)
                        : [...formData.genres, genre],
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.genres.includes(genre)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="emotional, thought-provoking, inspiring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gallery Images (up to 10)
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                placeholder="Image URL"
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                disabled={formData.image_urls.length >= 10}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                Add
              </button>
            </div>

            {formData.image_urls.length > 0 && (
              <div className="space-y-2">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg">
                    <span className="text-sm text-gray-400 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="ml-2 p-1 text-red-400 hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="featured"
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-300">
              Featured Review
            </label>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-800">
            <div>
              {slug && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 font-medium rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : slug ? 'Update Review' : 'Add Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
