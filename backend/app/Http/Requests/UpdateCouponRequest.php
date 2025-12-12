<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $couponId = $this->route('coupon')->id ?? null;

        return [
            'code' => ['sometimes', 'string', 'unique:coupons,code,' . $couponId, 'max:50'],
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['sometimes', 'in:percentage,fixed'],
            'value' => ['sometimes', 'numeric', 'min:0.01'],
            'min_purchase' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_customer_limit' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['sometimes', 'date', 'date_format:Y-m-d H:i:s'],
            'end_date' => ['nullable', 'date', 'date_format:Y-m-d H:i:s', 'after:start_date'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'This coupon code already exists',
            'type.in' => 'Coupon type must be percentage or fixed',
            'value.min' => 'Coupon value must be greater than 0',
            'end_date.after' => 'End date must be after start date',
        ];
    }
}
