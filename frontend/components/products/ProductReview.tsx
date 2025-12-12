'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useReviews } from '@/lib/hooks/useReviews';
import { useNotifications } from '@/lib/stores/notificationStore';
import { useLoadingStore } from '@/lib/stores/loadingStore';

interface ProductReviewProps {
  productId: string | number;
  onReviewAdded?: () => void;
}

export const ProductReview = ({ productId, onReviewAdded }: ProductReviewProps) => {
  const { reviews, stats, loading, error, createReview, deleteReview, markHelpful, markUnhelpful } = useReviews(productId);
  const { success, error: errorNotif } = useNotifications();
  const { setLoading: setLoadingState } = useLoadingStore();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    content: '',
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      errorNotif('Please fill in all fields');
      return;
    }

    setLoadingState('review-submit', true);
    try {
      await createReview({
        product_id: typeof productId === 'string' ? parseInt(productId, 10) : productId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.content,
      });

      success('Review posted successfully!');
      setFormData({ rating: 5, title: '', content: '' });
      setShowReviewForm(false);
      onReviewAdded?.();
    } catch (err) {
      errorNotif(err instanceof Error ? err.message : 'Failed to post review');
    } finally {
      setLoadingState('review-submit', false);
    }
  };

  const handleDeleteReview = async (reviewId: string | number) => {
    setLoadingState('review-delete', true);
    try {
      await deleteReview(reviewId);
      success('Review deleted successfully');
    } catch (err) {
      errorNotif(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setLoadingState('review-delete', false);
    }
  };

  const handleMarkHelpful = async (reviewId: string | number) => {
    try {
      await markHelpful(reviewId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkUnhelpful = async (reviewId: string | number) => {
    try {
      await markUnhelpful(reviewId);
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const renderRatingStars = (rating: number, onChange?: (r: number) => void) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onChange?.(i + 1)}
        className="transition-transform hover:scale-110"
      >
        <Star
          size={24}
          className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      </button>
    ));
  };

  const ratingDistribution = stats?.rating_distribution || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  const totalReviews = stats?.total_reviews || 0;
  const averageRating = stats?.average_rating || 0;

  if (loading) {
    return (
      <div className="w-full py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="mt-2 text-sm text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Rating Summary */}
      <Card className="border-0 bg-gray-50 p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Overall Rating */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="flex gap-1">{renderStars(Math.round(averageRating))}</div>
            <p className="text-sm text-gray-600">Based on {totalReviews} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="min-w-fit text-sm text-gray-600">{rating} star</span>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="min-w-fit text-sm text-gray-600">({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Write Review Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <Card className="space-y-4 border-primary/20 bg-primary/5 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Rating</label>
            <div className="flex gap-2">
              {renderRatingStars(formData.rating, (r) =>
                setFormData({ ...formData, rating: r })
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Title</label>
            <input
              type="text"
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of your experience"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-gray-500">{formData.title.length}/100</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Review</label>
            <textarea
              maxLength={1000}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your detailed experience with this product..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-gray-500">{formData.content.length}/1000</p>
          </div>

          <Button
            onClick={handleSubmitReview}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Post Review
          </Button>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Customer Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <Card className="bg-gray-50 p-6 text-center">
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="space-y-3 p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                    {review.verified_purchase && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Verified
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900">{review.title}</h4>
                  <p className="text-xs text-gray-500">
                    by {review.user_name} • {review.created_at}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Delete review"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="text-sm text-gray-700">{review.comment}</p>

              <div className="flex items-center gap-4 border-t pt-3">
                <div className="text-xs text-gray-600">Was this helpful?</div>
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-green-50 hover:text-green-600"
                >
                  <ThumbsUp size={14} />
                  <span className="text-xs">{review.helpful_count || 0}</span>
                </button>
                <button
                  onClick={() => handleMarkUnhelpful(review.id)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <ThumbsDown size={14} />
                  <span className="text-xs">{review.unhelpful_count || 0}</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
