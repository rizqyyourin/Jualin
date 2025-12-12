<?php

namespace App\Http\Controllers;

use App\Models\CustomerAddress;
use Illuminate\Http\Request;

class CustomerAddressController extends Controller
{

    /**
     * Display customer's addresses
     */
    public function index()
    {
        $addresses = auth()->user()
            ->addresses()
            ->orderBy('is_default', 'desc')
            ->get();

        return response()->json([
            'message' => 'Addresses retrieved successfully',
            'data' => $addresses,
        ]);
    }

    /**
     * Display a specific address
     */
    public function show(CustomerAddress $address)
    {
        // Check if address belongs to authenticated user
        if ($address->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to view this address',
            ], 403);
        }

        return response()->json([
            'message' => 'Address retrieved successfully',
            'data' => $address,
        ]);
    }

    /**
     * Store a new address
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|in:home,office,other',
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string',
            'province' => 'required|string',
            'postal_code' => 'required|string',
            'country' => 'nullable|string',
            'is_default' => 'nullable|boolean',
        ]);

        $validated['user_id'] = auth()->id();

        // If this should be default, unset others
        if ($validated['is_default'] ?? false) {
            auth()->user()->addresses()->update(['is_default' => false]);
        }

        $address = CustomerAddress::create($validated);

        return response()->json([
            'message' => 'Address created successfully',
            'data' => $address,
        ], 201);
    }

    /**
     * Update an address
     */
    public function update(Request $request, CustomerAddress $address)
    {
        // Check if address belongs to authenticated user
        if ($address->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to update this address',
            ], 403);
        }

        $validated = $request->validate([
            'label' => 'sometimes|in:home,office,other',
            'recipient_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'province' => 'sometimes|string',
            'postal_code' => 'sometimes|string',
            'country' => 'nullable|string',
            'is_default' => 'nullable|boolean',
        ]);

        // If setting as default, unset others
        if ($validated['is_default'] ?? false) {
            auth()->user()->addresses()->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json([
            'message' => 'Address updated successfully',
            'data' => $address,
        ]);
    }

    /**
     * Delete an address
     */
    public function destroy(CustomerAddress $address)
    {
        // Check if address belongs to authenticated user
        if ($address->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to delete this address',
            ], 403);
        }

        $address->delete();

        return response()->json([
            'message' => 'Address deleted successfully',
        ]);
    }

    /**
     * Set address as default
     */
    public function setDefault(CustomerAddress $address)
    {
        // Check if address belongs to authenticated user
        if ($address->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to modify this address',
            ], 403);
        }

        $address->setAsDefault();

        return response()->json([
            'message' => 'Default address updated successfully',
            'data' => $address,
        ]);
    }
}
