<?php

namespace App\Http\Controllers;

use App\Models\ShippingMethod;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    /**
     * Get shipping methods for merchant.
     */
    public function getMerchantMethods()
    {
        $user = auth()->user();

        if (!$user->isMerchant()) {
            return response()->json(['message' => 'Only merchants can access shipping methods'], 403);
        }

        $methods = ShippingMethod::where('merchant_id', $user->id)
            ->where('is_active', true)
            ->get();

        return response()->json([
            'data' => $methods->map(fn($method) => [
                'id' => $method->id,
                'name' => $method->name,
                'code' => $method->code,
                'description' => $method->description,
                'base_cost' => $method->base_cost,
                'calculation_type' => $method->calculation_type,
                'estimated_days' => $method->estimated_days,
                'is_active' => $method->is_active,
            ]),
        ]);
    }

    /**
     * Create shipping method (merchant only).
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user->isMerchant()) {
            return response()->json(['message' => 'Only merchants can create shipping methods'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:shipping_methods,code',
            'description' => 'nullable|string',
            'base_cost' => 'required|numeric|min:0',
            'calculation_type' => 'required|in:flat,weight_based,distance_based',
            'rates' => 'nullable|json',
            'estimated_days' => 'required|integer|min:1',
        ]);

        $method = ShippingMethod::create([
            'merchant_id' => $user->id,
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Shipping method created successfully',
            'data' => [
                'id' => $method->id,
                'name' => $method->name,
                'code' => $method->code,
                'base_cost' => $method->base_cost,
            ],
        ], 201);
    }

    /**
     * Get shipping method.
     */
    public function show(string $methodId)
    {
        $method = ShippingMethod::findOrFail($methodId);

        return response()->json([
            'data' => [
                'id' => $method->id,
                'name' => $method->name,
                'code' => $method->code,
                'description' => $method->description,
                'base_cost' => $method->base_cost,
                'calculation_type' => $method->calculation_type,
                'rates' => $method->rates,
                'estimated_days' => $method->estimated_days,
                'is_active' => $method->is_active,
            ],
        ]);
    }

    /**
     * Update shipping method (merchant only).
     */
    public function update(Request $request, string $methodId)
    {
        $method = ShippingMethod::findOrFail($methodId);

        if ($method->merchant_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'base_cost' => 'sometimes|numeric|min:0',
            'rates' => 'nullable|json',
            'estimated_days' => 'sometimes|integer|min:1',
            'is_active' => 'sometimes|boolean',
        ]);

        $method->update($validated);

        return response()->json([
            'message' => 'Shipping method updated successfully',
            'data' => [
                'id' => $method->id,
                'name' => $method->name,
                'base_cost' => $method->base_cost,
                'is_active' => $method->is_active,
            ],
        ]);
    }

    /**
     * Delete shipping method (merchant only).
     */
    public function destroy(string $methodId)
    {
        $method = ShippingMethod::findOrFail($methodId);

        if ($method->merchant_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $method->delete();

        return response()->json(['message' => 'Shipping method deleted successfully']);
    }

    /**
     * Calculate shipping cost.
     */
    public function calculateCost(Request $request, string $methodId)
    {
        $method = ShippingMethod::findOrFail($methodId);

        $validated = $request->validate([
            'total_weight' => 'nullable|numeric|min:0',
            'distance' => 'nullable|numeric|min:0',
        ]);

        $cost = $method->calculateCost(
            $validated['total_weight'] ?? 0,
            $validated['distance'] ?? 0
        );

        return response()->json([
            'data' => [
                'method_id' => $method->id,
                'method_name' => $method->name,
                'base_cost' => $method->base_cost,
                'calculated_cost' => $cost,
                'estimated_days' => $method->estimated_days,
            ],
        ]);
    }
}
