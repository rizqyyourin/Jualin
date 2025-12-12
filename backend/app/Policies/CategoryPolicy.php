<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Category;

class CategoryPolicy
{
    /**
     * Only merchants can create categories
     */
    public function create(User $user): bool
    {
        return $user->isMerchant();
    }

    /**
     * Only category owner can update
     */
    public function update(User $user, Category $category): bool
    {
        return $user->id === $category->user_id;
    }

    /**
     * Only category owner can delete
     */
    public function delete(User $user, Category $category): bool
    {
        return $user->id === $category->user_id;
    }
}
