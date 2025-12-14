<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CustomerAddressController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ShippingController;
use App\Http\Controllers\MerchantAnalyticsController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChatbotController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::group(['prefix' => 'auth'], function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
});

// Public product routes
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::get('/products/{product}/reviews', [ReviewController::class, 'index'])->name('reviews.index');
Route::get('/products/{product}/recommendations', [ProductController::class, 'recommendations'])->name('products.recommendations');
Route::get('/products/{product}/reviews/stats', [ProductController::class, 'reviewStats'])->name('products.reviewStats');

// Public category routes
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');

// Protected routes (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth endpoints
    Route::group(['prefix' => 'auth'], function () {
        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::post('/refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
    });

    // User profile endpoints
    Route::get('/user/profile', [UserController::class, 'profile'])->name('user.profile');
    Route::put('/user/profile', [UserController::class, 'updateProfile'])->name('user.updateProfile');
    Route::put('/user/password', [UserController::class, 'updatePassword'])->name('user.updatePassword');
    Route::delete('/user/account', [UserController::class, 'deleteAccount'])->name('user.deleteAccount');


    // Product endpoints
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::post('/products/{product}/images', [ProductController::class, 'uploadImages'])->name('products.uploadImages');
    Route::delete('/products/{product}/images/{productImage}', [ProductController::class, 'deleteImage'])->name('products.deleteImage');

    // Category endpoints
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Order endpoints
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::post('/orders/from-cart', [OrderController::class, 'createFromCart'])->name('orders.createFromCart');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.updateStatus');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/orders/{order}/confirm', [OrderController::class, 'confirm'])->name('orders.confirm');
    Route::post('/orders/{order}/complete', [OrderController::class, 'complete'])->name('orders.complete');


    // Customer Address endpoints
    Route::get('/addresses', [CustomerAddressController::class, 'index'])->name('addresses.index');
    Route::post('/addresses', [CustomerAddressController::class, 'store'])->name('addresses.store');
    Route::get('/addresses/{address}', [CustomerAddressController::class, 'show'])->name('addresses.show');
    Route::put('/addresses/{address}', [CustomerAddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{address}', [CustomerAddressController::class, 'destroy'])->name('addresses.destroy');
    Route::post('/addresses/{address}/set-default', [CustomerAddressController::class, 'setDefault'])->name('addresses.setDefault');

    // Review endpoints
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::get('/reviews/{review}', [ReviewController::class, 'show'])->name('reviews.show');
    Route::put('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
    Route::post('/reviews/{review}/helpful', [ReviewController::class, 'markHelpful'])->name('reviews.helpful');
    Route::post('/reviews/{review}/unhelpful', [ReviewController::class, 'markUnhelpful'])->name('reviews.unhelpful');
    Route::post('/reviews/{review}/approve', [ReviewController::class, 'approve'])->name('reviews.approve');
    Route::post('/reviews/{review}/reject', [ReviewController::class, 'reject'])->name('reviews.reject');

    // Cart endpoints (Phase 4)
    Route::get('/cart', [CartController::class, 'show'])->name('cart.show');
    Route::post('/cart/items', [CartController::class, 'addItem'])->name('cart.addItem');
    Route::put('/cart/items/{itemId}', [CartController::class, 'updateItem'])->name('cart.updateItem');
    Route::delete('/cart/items/{itemId}', [CartController::class, 'removeItem'])->name('cart.removeItem');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');
    Route::post('/cart/discount', [CartController::class, 'applyDiscount'])->name('cart.applyDiscount');

    // Wishlist endpoints (Phase 4)
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/{wishlistId}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::post('/wishlist/check', [WishlistController::class, 'isInWishlist'])->name('wishlist.check');

    // Payment endpoints (Phase 4)
    Route::post('/payments', [PaymentController::class, 'createPayment'])->name('payments.store');
    Route::get('/payments/{paymentId}', [PaymentController::class, 'show'])->name('payments.show');
    Route::get('/orders/{orderId}/payment', [PaymentController::class, 'getByOrder'])->name('payments.getByOrder');
    Route::post('/payments/{paymentId}/confirm', [PaymentController::class, 'confirmPayment'])->name('payments.confirm');
    Route::post('/payments/{paymentId}/fail', [PaymentController::class, 'failPayment'])->name('payments.fail');
    Route::post('/payments/{paymentId}/refund', [PaymentController::class, 'refund'])->name('payments.refund');

    // Shipping endpoints (Phase 4)
    Route::get('/shipping-methods', [ShippingController::class, 'getMerchantMethods'])->name('shipping.methods');
    Route::post('/shipping-methods', [ShippingController::class, 'store'])->name('shipping.store');
    Route::get('/shipping-methods/{methodId}', [ShippingController::class, 'show'])->name('shipping.show');
    Route::put('/shipping-methods/{methodId}', [ShippingController::class, 'update'])->name('shipping.update');
    Route::delete('/shipping-methods/{methodId}', [ShippingController::class, 'destroy'])->name('shipping.destroy');
    Route::post('/shipping-methods/{methodId}/calculate', [ShippingController::class, 'calculateCost'])->name('shipping.calculate');

    // Merchant Analytics endpoints (Phase 4)
    Route::group(['prefix' => 'analytics'], function () {
        Route::get('/dashboard', [MerchantAnalyticsController::class, 'dashboard'])->name('analytics.dashboard');
        Route::get('/sales', [MerchantAnalyticsController::class, 'sales'])->name('analytics.sales');
        Route::get('/top-products', [MerchantAnalyticsController::class, 'topProducts'])->name('analytics.topProducts');
        Route::get('/customers', [MerchantAnalyticsController::class, 'customers'])->name('analytics.customers');
        Route::post('/record-daily', [MerchantAnalyticsController::class, 'recordDaily'])->name('analytics.recordDaily');
    });

    // Admin endpoints (Phase 4)
    Route::group(['prefix' => 'admin'], function () {
        Route::get('/users', [AdminController::class, 'listUsers'])->name('admin.users');
        Route::get('/users/{userId}', [AdminController::class, 'getUser'])->name('admin.user');
        Route::put('/users/{userId}/status', [AdminController::class, 'updateUserStatus'])->name('admin.updateStatus');
        Route::put('/users/{userId}/role', [AdminController::class, 'updateUserRole'])->name('admin.updateRole');
        Route::delete('/users/{userId}', [AdminController::class, 'deleteUser'])->name('admin.deleteUser');
        Route::get('/statistics', [AdminController::class, 'statistics'])->name('admin.statistics');
        Route::get('/products', [AdminController::class, 'searchProducts'])->name('admin.products');
    });

    // Chatbot endpoints (authenticated + guest via optional auth)
    Route::group(['prefix' => 'chatbot'], function () {
        Route::post('/message', [ChatbotController::class, 'sendMessage'])->name('chatbot.message')->withoutMiddleware('auth:sanctum');
        Route::get('/conversation/{sessionId}', [ChatbotController::class, 'getConversation'])->name('chatbot.conversation')->withoutMiddleware('auth:sanctum');
        Route::delete('/conversation/{sessionId}', [ChatbotController::class, 'clearConversation'])->name('chatbot.clear')->withoutMiddleware('auth:sanctum');
        Route::post('/recommendations', [ChatbotController::class, 'getRecommendations'])->name('chatbot.recommendations');
    });
});

