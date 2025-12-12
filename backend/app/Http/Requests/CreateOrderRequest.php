<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'merchant_id' => ['required', 'integer', 'exists:users,id'],
            'coupon_code' => ['nullable', 'string', 'exists:coupons,code'],
            'shipping_cost' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string', 'in:bank_transfer,credit_card,e_wallet,cod'],
            'shipping_method' => ['nullable', 'string'],
            'shipping_address' => ['nullable', 'array'],
            'shipping_address.street' => ['nullable', 'string', 'max:255'],
            'shipping_address.city' => ['nullable', 'string', 'max:100'],
            'shipping_address.province' => ['nullable', 'string', 'max:100'],
            'shipping_address.postal_code' => ['nullable', 'string', 'max:10'],
            'customer_notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'merchant_id.required' => 'Merchant ID is required',
            'merchant_id.exists' => 'Merchant not found',
            'shipping_cost.required' => 'Shipping cost is required',
            'payment_method.required' => 'Payment method is required',
            'payment_method.in' => 'Invalid payment method',
        ];
    }
}
