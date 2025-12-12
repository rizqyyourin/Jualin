<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'unique:coupons', 'max:50'],
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'min_purchase' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_customer_limit' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['required', 'date', 'date_format:Y-m-d H:i:s'],
            'end_date' => ['nullable', 'date', 'date_format:Y-m-d H:i:s', 'after:start_date'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Coupon code is required',
            'code.unique' => 'This coupon code already exists',
            'type.required' => 'Coupon type is required (percentage or fixed)',
            'value.required' => 'Coupon value is required',
            'value.min' => 'Coupon value must be greater than 0',
            'start_date.required' => 'Start date is required',
            'end_date.after' => 'End date must be after start date',
        ];
    }
}
