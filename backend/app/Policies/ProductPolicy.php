<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Product;

class ProductPolicy
{
    /**
     * Only merchants can create products
     */
    public function create(User $user): bool
    {
        return $user->isMerchant();
    }

    /**
     * Only product owner can update
     */
    public function update(User $user, Product $product): bool
    {
        return $user->id === $product->user_id;
    }

    /**
     * Only product owner can delete
     */
    public function delete(User $user, Product $product): bool
    {
        return $user->id === $product->user_id;
    }
}
