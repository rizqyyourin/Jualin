<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{

    /**
     * Display approved reviews for a product
     */
    public function index(Request $request, Product $product)
    {
        $reviews = Review::where('product_id', $product->id)
            ->approved()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        // Add user vote status if authenticated
        if (auth()->check()) {
            $userId = auth()->id();
            $reviewIds = $reviews->pluck('id');

            // Get user's votes for these reviews
            $userVotes = \DB::table('review_votes')
                ->whereIn('review_id', $reviewIds)
                ->where('user_id', $userId)
                ->get()
                ->keyBy('review_id');

            // Add vote status to each review
            $reviews->getCollection()->transform(function ($review) use ($userVotes) {
                $review->user_vote = $userVotes->get($review->id)?->vote_type ?? null;
                return $review;
            });
        }

        return response()->json([
            'message' => 'Reviews retrieved successfully',
            'data' => $reviews,
        ]);
    }

    /**
     * Display a specific review
     */
    public function show(Review $review)
    {
        $review->load('user', 'product', 'order');

        return response()->json([
            'message' => 'Review retrieved successfully',
            'data' => $review,
        ]);
    }

    /**
     * Store a new review
     * Only customers who bought the product can review
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'order_id' => 'nullable|exists:orders,id', // Made optional
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:2000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        \Log::info('Review validation passed', ['validated' => $validated, 'user_id' => auth()->id()]);

        $user = auth()->user();

        // Verify order if provided
        if (!empty($validated['order_id'])) {
            $order = $user->orders()->find($validated['order_id']);
            if (!$order) {
                return response()->json([
                    'message' => 'Order not found',
                ], 404);
            }

            $productInOrder = $order->items()
                ->where('product_id', $validated['product_id'])
                ->exists();

            if (!$productInOrder) {
                return response()->json([
                    'message' => 'Product not in this order',
                ], 422);
            }
        }

        // Check if already reviewed
        $existingReview = Review::where('product_id', $validated['product_id'])
            ->where('user_id', $user->id);

        if (!empty($validated['order_id'])) {
            $existingReview->where('order_id', $validated['order_id']);
        }

        if ($existingReview->exists()) {
            return response()->json([
                'message' => 'You have already reviewed this product',
                'errors' => [
                    'product_id' => ['You have already reviewed this product']
                ]
            ], 422);
        }

        // Handle images
        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store("reviews", 'public');
                $images[] = $path;
            }
        }

        // Create review
        $review = Review::create([
            'product_id' => $validated['product_id'],
            'user_id' => $user->id,
            'order_id' => $validated['order_id'] ?? null,
            'rating' => $validated['rating'],
            'title' => $validated['title'],
            'comment' => $validated['comment'] ?? null,
            'images' => $images,
            'status' => 'approved', // Auto-approve reviews
        ]);

        $review->load('user', 'product');

        return response()->json([
            'message' => 'Review submitted successfully. Pending approval.',
            'data' => $review,
        ], 201);
    }

    /**
     * Update a review
     * Only review author can update their own review
     */
    public function update(Request $request, Review $review)
    {
        // Check authorization
        if ($review->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to update this review',
            ], 403);
        }

        // Can only update pending reviews
        if ($review->status !== 'pending') {
            return response()->json([
                'message' => 'Can only update pending reviews',
            ], 422);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'title' => 'sometimes|string|max:255',
            'comment' => 'nullable|string|max:2000',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Review updated successfully',
            'data' => $review,
        ]);
    }

    /**
     * Delete a review
     * Only review author or product merchant can delete
     */
    public function destroy(Review $review)
    {
        $user = auth()->user();

        // Check authorization
        if ($review->user_id !== $user->id && $review->product->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to delete this review',
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully',
        ]);
    }

    /**
     * Mark review as helpful
     */
    public function markHelpful(Review $review)
    {
        $user = auth()->user();

        \Log::info('markHelpful called', [
            'review_id' => $review->id,
            'user_id' => $user->id,
        ]);

        // Check if user already voted
        $existingVote = \DB::table('review_votes')
            ->where('review_id', $review->id)
            ->where('user_id', $user->id)
            ->first();

        \Log::info('Existing vote check', [
            'existing_vote' => $existingVote ? $existingVote->vote_type : 'none',
        ]);

        if ($existingVote) {
            if ($existingVote->vote_type === 'helpful') {
                \Log::info('User already voted helpful');
                return response()->json([
                    'message' => 'You have already marked this review as helpful',
                ], 422);
            }

            // Switch from unhelpful to helpful
            \DB::table('review_votes')
                ->where('review_id', $review->id)
                ->where('user_id', $user->id)
                ->update(['vote_type' => 'helpful', 'updated_at' => now()]);

            $review->decrement('unhelpful_count');
            $review->increment('helpful_count');
        } else {
            // New vote
            \DB::table('review_votes')->insert([
                'review_id' => $review->id,
                'user_id' => $user->id,
                'vote_type' => 'helpful',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $review->increment('helpful_count');
        }

        return response()->json([
            'message' => 'Thank you for your feedback',
            'data' => $review->fresh(),
        ]);
    }

    /**
     * Mark review as unhelpful
     */
    public function markUnhelpful(Review $review)
    {
        $user = auth()->user();

        // Check if user already voted
        $existingVote = \DB::table('review_votes')
            ->where('review_id', $review->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingVote) {
            if ($existingVote->vote_type === 'unhelpful') {
                return response()->json([
                    'message' => 'You have already marked this review as unhelpful',
                ], 422);
            }

            // Switch from helpful to unhelpful
            \DB::table('review_votes')
                ->where('review_id', $review->id)
                ->where('user_id', $user->id)
                ->update(['vote_type' => 'unhelpful', 'updated_at' => now()]);

            $review->decrement('helpful_count');
            $review->increment('unhelpful_count');
        } else {
            // New vote
            \DB::table('review_votes')->insert([
                'review_id' => $review->id,
                'user_id' => $user->id,
                'vote_type' => 'unhelpful',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $review->increment('unhelpful_count');
        }

        return response()->json([
            'message' => 'Thank you for your feedback',
            'data' => $review->fresh(),
        ]);
    }

    /**
     * Approve review (merchant only)
     */
    public function approve(Review $review)
    {
        // Check if user is product merchant
        if ($review->product->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to approve this review',
            ], 403);
        }

        $review->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Review approved successfully',
            'data' => $review,
        ]);
    }

    /**
     * Reject review (merchant only)
     */
    public function reject(Request $request, Review $review)
    {
        // Check if user is product merchant
        if ($review->product->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to reject this review',
            ], 403);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        $review->update([
            'status' => 'rejected',
            'notes' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'Review rejected successfully',
            'data' => $review,
        ]);
    }
}
