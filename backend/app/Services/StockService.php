<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Stock;
use App\Models\StockHistory;

class StockService
{
    /**
     * Check if product has sufficient stock.
     */
    public function hasStock(int $productId, int $quantity): bool
    {
        $stock = Stock::where('product_id', $productId)->first();
        return $stock && $stock->quantity >= $quantity;
    }

    /**
     * Get available stock for a product.
     */
    public function getAvailableStock(int $productId): int
    {
        $stock = Stock::where('product_id', $productId)->first();
        return $stock ? $stock->quantity : 0;
    }

    /**
     * Deduct stock when order is created.
     */
    public function deductStock(int $productId, int $quantity, string $reason = 'purchase'): bool
    {
        $stock = Stock::lockForUpdate()
            ->where('product_id', $productId)
            ->first();

        if (!$stock || $stock->quantity < $quantity) {
            return false;
        }

        $stock->quantity -= $quantity;
        $stock->save();

        // Record history
        StockHistory::create([
            'product_id' => $productId,
            'quantity_before' => $stock->quantity + $quantity,
            'quantity_after' => $stock->quantity,
            'reason' => $reason,
            'notes' => ucfirst($reason) . ' stock deduction',
        ]);

        return true;
    }

    /**
     * Return stock when order is cancelled.
     */
    public function returnStock(int $productId, int $quantity, string $reason = 'return'): void
    {
        $stock = Stock::lockForUpdate()
            ->where('product_id', $productId)
            ->first();

        if ($stock) {
            $stock->quantity += $quantity;
            $stock->save();

            StockHistory::create([
                'product_id' => $productId,
                'quantity_before' => $stock->quantity - $quantity,
                'quantity_after' => $stock->quantity,
                'reason' => $reason,
                'notes' => ucfirst($reason) . ' stock return',
            ]);
        }
    }

    /**
     * Check low stock alert (less than 10 units).
     */
    public function hasLowStock(int $productId, int $threshold = 10): bool
    {
        return $this->getAvailableStock($productId) < $threshold;
    }

    /**
     * Adjust stock for inventory correction.
     */
    public function adjustStock(int $productId, int $quantity, string $notes = ''): void
    {
        $stock = Stock::lockForUpdate()
            ->where('product_id', $productId)
            ->first();

        if ($stock) {
            $oldQuantity = $stock->quantity;
            $stock->quantity += $quantity;
            $stock->save();

            StockHistory::create([
                'product_id' => $productId,
                'quantity_before' => $oldQuantity,
                'quantity_after' => $stock->quantity,
                'reason' => 'adjustment',
                'notes' => $notes ?: 'Inventory adjustment',
            ]);
        }
    }
}
