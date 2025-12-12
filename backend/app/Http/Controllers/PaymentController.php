<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Create payment for order.
     */
    public function createPayment(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|in:credit_card,bank_transfer,e_wallet,cash_on_delivery',
            'amount' => 'required|numeric|min:0',
        ]);

        $user = auth()->user();
        $order = Order::findOrFail($validated['order_id']);

        // Check if user is the customer who placed the order
        if ($order->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if payment already exists
        if ($order->payment) {
            return response()->json([
                'message' => 'Payment already exists for this order',
                'data' => $order->payment,
            ], 409);
        }

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'payment_method' => $validated['payment_method'],
            'amount' => $validated['amount'],
            'status' => 'pending',
            'reference_number' => 'PAY-' . date('YmdHis') . '-' . rand(1000, 9999),
        ]);

        return response()->json([
            'message' => 'Payment created successfully',
            'data' => [
                'id' => $payment->id,
                'order_id' => $payment->order_id,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'amount' => $payment->amount,
                'reference_number' => $payment->reference_number,
            ],
        ], 201);
    }

    /**
     * Get payment details.
     */
    public function show(string $paymentId)
    {
        $payment = Payment::findOrFail($paymentId);

        if ($payment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => [
                'id' => $payment->id,
                'order_id' => $payment->order_id,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'amount' => $payment->amount,
                'reference_number' => $payment->reference_number,
                'payment_gateway_id' => $payment->payment_gateway_id,
                'paid_at' => $payment->paid_at,
                'created_at' => $payment->created_at,
            ],
        ]);
    }

    /**
     * Get payment by order.
     */
    public function getByOrder(string $orderId)
    {
        $order = Order::findOrFail($orderId);

        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment = $order->payment;

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $payment->id,
                'order_id' => $payment->order_id,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'amount' => $payment->amount,
                'reference_number' => $payment->reference_number,
                'paid_at' => $payment->paid_at,
            ],
        ]);
    }

    /**
     * Confirm payment (simulate payment gateway response).
     */
    public function confirmPayment(Request $request, string $paymentId)
    {
        $payment = Payment::findOrFail($paymentId);

        if ($payment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'payment_gateway_id' => 'nullable|string',
            'gateway_response' => 'nullable|array',
        ]);

        $payment->update([
            'status' => 'success',
            'paid_at' => now(),
            'payment_gateway_id' => $validated['payment_gateway_id'] ?? null,
            'payment_details' => $validated['gateway_response'] ?? null,
        ]);

        // Update order status to confirmed
        $order = $payment->order;
        $order->update(['status' => 'confirmed']);

        return response()->json([
            'message' => 'Payment confirmed successfully',
            'data' => [
                'id' => $payment->id,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at,
                'order_status' => $order->status,
            ],
        ]);
    }

    /**
     * Fail payment.
     */
    public function failPayment(Request $request, string $paymentId)
    {
        $payment = Payment::findOrFail($paymentId);

        if ($payment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $payment->update([
            'status' => 'failed',
            'payment_details' => ['reason' => $validated['reason'] ?? 'Payment declined'],
        ]);

        return response()->json([
            'message' => 'Payment marked as failed',
            'data' => ['id' => $payment->id, 'status' => $payment->status],
        ]);
    }

    /**
     * Refund payment.
     */
    public function refund(Request $request, string $paymentId)
    {
        $payment = Payment::findOrFail($paymentId);

        $user = auth()->user();
        if ($payment->order->merchant_id !== $user->id && $payment->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($payment->status !== 'success') {
            return response()->json(['message' => 'Can only refund successful payments'], 400);
        }

        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'reason' => 'required|string',
        ]);

        $refundAmount = $validated['amount'] ?? $payment->amount;

        $payment->update([
            'status' => 'refunded',
            'payment_details' => ['refund_amount' => $refundAmount, 'reason' => $validated['reason']],
        ]);

        return response()->json([
            'message' => 'Payment refunded successfully',
            'data' => ['id' => $payment->id, 'refund_amount' => $refundAmount],
        ]);
    }
}
