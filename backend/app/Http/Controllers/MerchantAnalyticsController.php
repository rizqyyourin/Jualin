<?php

namespace App\Http\Controllers;

use App\Models\MerchantAnalytic;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class MerchantAnalyticsController extends Controller
{
    /**
     * Get merchant dashboard overview.
     */
    public function dashboard()
    {
        $user = auth()->user();

        if (!$user->isMerchant()) {
            return response()->json(['message' => 'Only merchants can access analytics'], 403);
        }

        // Get today's analytics
        $todayAnalytics = MerchantAnalytic::where('merchant_id', $user->id)
            ->whereDate('date', today())
            ->first();

        // Get this month's total revenue
        $monthRevenue = Order::where('merchant_id', $user->id)
            ->whereYear('created_at', date('Y'))
            ->whereMonth('created_at', date('m'))
            ->where('status', '!=', 'cancelled')
            ->sum('total_price');

        // Get total products
        $totalProducts = $user->products()->count();

        // Get total customers who bought
        $totalCustomers = Order::where('merchant_id', $user->id)
            ->distinct('user_id')
            ->count('user_id');

        return response()->json([
            'data' => [
                'today' => [
                    'orders' => $todayAnalytics?->total_orders ?? 0,
                    'revenue' => $todayAnalytics?->total_revenue ?? '0.00',
                    'visitors' => $todayAnalytics?->total_visitors ?? 0,
                ],
                'this_month' => [
                    'revenue' => $monthRevenue,
                ],
                'total' => [
                    'products' => $totalProducts,
                    'customers' => $totalCustomers,
                ],
            ],
        ]);
    }

    /**
     * Get sales analytics.
     */
    public function sales(Request $request)
    {
        $user = auth()->user();

        if (!$user->isMerchant()) {
            return response()->json(['message' => 'Only merchants can access analytics'], 403);
        }

        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'period' => 'nullable|in:daily,weekly,monthly',
        ]);

        $query = Order::where('merchant_id', $user->id)
            ->where('status', '!=', 'cancelled');

        if ($validated['start_date'] ?? null) {
            $query->whereDate('created_at', '>=', $validated['start_date']);
        }

        if ($validated['end_date'] ?? null) {
            $query->whereDate('created_at', '<=', $validated['end_date']);
        }

        $period = $validated['period'] ?? 'daily';
        $salesData = [];

        if ($period === 'daily') {
            $salesData = $query->selectRaw('DATE(created_at) as date, COUNT(*) as total_orders, SUM(total_price) as total_revenue')
                ->groupBy('date')
                ->get()
                ->toArray();
        } elseif ($period === 'weekly') {
            $salesData = $query->selectRaw('STRFTIME("%Y-W%W", created_at) as week, COUNT(*) as total_orders, SUM(total_price) as total_revenue')
                ->groupBy('week')
                ->get()
                ->toArray();
        } elseif ($period === 'monthly') {
            $salesData = $query->selectRaw('STRFTIME("%Y-%m", created_at) as month, COUNT(*) as total_orders, SUM(total_price) as total_revenue')
                ->groupBy('month')
                ->get()
                ->toArray();
        }

        return response()->json([
            'data' => $salesData,
        ]);
    }

    /**
     * Get top products.
     */
    public function topProducts()
    {
        $user = auth()->user();

        if (!$user->isMerchant()) {
            return response()->json(['message' => 'Only merchants can access analytics'], 403);
        }

        $topProducts = OrderItem::whereIn('product_id', $user->products()->pluck('id'))
            ->selectRaw('product_id, COUNT(*) as total_sold, SUM(quantity) as quantity_sold, SUM(unit_price * quantity) as total_revenue')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->with('product')
            ->get();

        return response()->json([
            'data' => $topProducts->map(fn($item) => [
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'total_sold' => $item->total_sold,
                'quantity_sold' => $item->quantity_sold,
                'total_revenue' => $item->total_revenue,
            ]),
        ]);
    }

    /**
     * Get customer insights.
     */
    public function customers()
    {
        $user = auth()->user();

        if (!$user->isMerchant()) {
            return response()->json(['message' => 'Only merchants can access analytics'], 403);
        }

        $totalCustomers = Order::where('merchant_id', $user->id)
            ->distinct('user_id')
            ->count('user_id');

        $returningCustomers = Order::where('merchant_id', $user->id)
            ->selectRaw('user_id, COUNT(*) as order_count')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        $avgOrderValue = Order::where('merchant_id', $user->id)
            ->where('status', '!=', 'cancelled')
            ->avg('total_price');

        $topCustomers = Order::where('merchant_id', $user->id)
            ->selectRaw('user_id, COUNT(*) as total_orders, SUM(total_price) as total_spent')
            ->groupBy('user_id')
            ->orderByDesc('total_spent')
            ->limit(10)
            ->with('customer:id,name,email')
            ->get();

        return response()->json([
            'data' => [
                'total_customers' => $totalCustomers,
                'returning_customers' => $returningCustomers,
                'average_order_value' => $avgOrderValue,
                'top_customers' => $topCustomers->map(fn($order) => [
                    'customer_id' => $order->user_id,
                    'customer_name' => $order->customer->name,
                    'customer_email' => $order->customer->email,
                    'total_orders' => $order->total_orders,
                    'total_spent' => $order->total_spent,
                ]),
            ],
        ]);
    }

    /**
     * Store analytics data (for background job/cron).
     */
    public function recordDaily(Request $request)
    {
        $validated = $request->validate([
            'merchant_id' => 'required|exists:users,id',
            'date' => 'nullable|date',
        ]);

        $user = auth()->user();
        if ($user->id !== $validated['merchant_id'] && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $date = $validated['date'] ?? today();
        $merchantId = $validated['merchant_id'];

        // Calculate daily metrics
        $orders = Order::where('merchant_id', $merchantId)
            ->whereDate('created_at', $date)
            ->where('status', '!=', 'cancelled');

        $totalOrders = $orders->count();
        $totalRevenue = $orders->sum('total_price');
        $totalProductsSold = OrderItem::whereIn('order_id', $orders->pluck('id'))
            ->sum('quantity');

        $topProducts = OrderItem::whereIn('order_id', $orders->pluck('id'))
            ->selectRaw('product_id, COUNT(*) as count')
            ->groupBy('product_id')
            ->orderByDesc('count')
            ->limit(5)
            ->pluck('product_id')
            ->toArray();

        MerchantAnalytic::updateOrCreate(
            ['merchant_id' => $merchantId, 'date' => $date],
            [
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'total_products_sold' => $totalProductsSold,
                'top_products' => $topProducts,
                'average_order_value' => $totalOrders > 0 ? $totalRevenue / $totalOrders : 0,
            ]
        );

        return response()->json([
            'message' => 'Analytics recorded successfully',
        ]);
    }
}
