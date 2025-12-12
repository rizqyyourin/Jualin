<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * List all users (admin only).
     */
    public function listUsers(Request $request)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'role' => 'nullable|in:merchant,customer,admin',
            'status' => 'nullable|in:active,inactive',
            'search' => 'nullable|string',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = User::query();

        if ($validated['role'] ?? null) {
            $query->where('role', $validated['role']);
        }

        if ($validated['status'] ?? null) {
            $isActive = $validated['status'] === 'active';
            $query->where('is_active', $isActive);
        }

        if ($validated['search'] ?? null) {
            $query->where('name', 'like', '%' . $validated['search'] . '%')
                ->orWhere('email', 'like', '%' . $validated['search'] . '%');
        }

        $perPage = $validated['per_page'] ?? 15;
        $users = $query->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    /**
     * Get user details (admin only).
     */
    public function getUser(string $userId)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::with('profile')->findOrFail($userId);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'profile' => $user->profile,
            ],
        ]);
    }

    /**
     * Update user status (admin only).
     */
    public function updateUserStatus(Request $request, string $userId)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user = User::findOrFail($userId);
        $user->update(['is_active' => $validated['is_active']]);

        return response()->json([
            'message' => 'User status updated successfully',
            'data' => ['id' => $user->id, 'is_active' => $user->is_active],
        ]);
    }

    /**
     * Update user role (admin only).
     */
    public function updateUserRole(Request $request, string $userId)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'role' => 'required|in:merchant,customer,admin',
        ]);

        $user = User::findOrFail($userId);
        $user->update(['role' => $validated['role']]);

        return response()->json([
            'message' => 'User role updated successfully',
            'data' => ['id' => $user->id, 'role' => $user->role],
        ]);
    }

    /**
     * Delete user (admin only).
     */
    public function deleteUser(string $userId)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($userId);

        // Prevent deleting the current admin
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Get platform statistics (admin only).
     */
    public function statistics()
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $totalUsers = User::count();
        $totalMerchants = User::where('role', 'merchant')->count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $activeUsers = User::where('is_active', true)->count();

        return response()->json([
            'data' => [
                'total_users' => $totalUsers,
                'merchants' => $totalMerchants,
                'customers' => $totalCustomers,
                'admins' => $totalAdmins,
                'active_users' => $activeUsers,
                'inactive_users' => $totalUsers - $activeUsers,
            ],
        ]);
    }

    /**
     * Search products by merchant (admin only).
     */
    public function searchProducts(Request $request)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'query' => 'nullable|string',
            'merchant_id' => 'nullable|exists:users,id',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = \App\Models\Product::query();

        if ($validated['merchant_id'] ?? null) {
            $query->where('user_id', $validated['merchant_id']);
        }

        if ($validated['query'] ?? null) {
            $query->where('name', 'like', '%' . $validated['query'] . '%')
                ->orWhere('description', 'like', '%' . $validated['query'] . '%');
        }

        $perPage = $validated['per_page'] ?? 15;
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
            ],
        ]);
    }
}
