import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  averageRating: number;
  totalRatings: number;
  userRating?: number;
  onRate?: (rating: number) => Promise<void>;
  disabled?: boolean;
}

export function StarRating({
  averageRating,
  totalRatings,
  userRating,
  onRate,
  disabled,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRate = async (rating: number) => {
    if (!onRate || disabled || loading) return;
    setLoading(true);
    try {
      await onRate(rating);
    } catch (error) {
      console.error('Error rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoverRating || userRating || 0;

  return (
    <div className="flex flex-col items-start space-y-3">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => onRate && setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={disabled || loading || !onRate}
              className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
              title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600 hover:text-yellow-400'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-400">
          {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      </div>

      {userRating && (
        <p className="text-xs text-gray-500">
          Your rating: {userRating} star{userRating !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
