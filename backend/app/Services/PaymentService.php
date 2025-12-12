<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\TransactionLog;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Create payment record for order.
     */
    public function createPayment(Order $order, array $data): Payment
    {
        return DB::transaction(function () use ($order, $data) {
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'amount' => $order->total_price,
                'payment_method' => $data['payment_method'] ?? 'transfer',
                'status' => 'pending',
                'external_transaction_id' => $data['external_transaction_id'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            // Log transaction
            TransactionLog::log(
                $order->user_id,
                'deposit',
                $order->total_price,
                'Payment initiated for order',
                [
                    'payment_method' => $data['payment_method'] ?? 'transfer',
                ],
                $order->id,
                $payment->id
            );

            return $payment;
        });
    }

    /**
     * Verify payment from external gateway.
     */
    public function verifyPayment(Payment $payment, array $verificationData): bool
    {
        // This would integrate with actual payment gateway verification
        // For now, we'll simulate verification
        if (!isset($verificationData['signature'])) {
            return false;
        }

        // In production: verify signature with payment gateway
        $isValid = true; // Placeholder

        if ($isValid) {
            return true;
        }

        return false;
    }

    /**
     * Mark payment as verified/completed.
     */
    public function markAsCompleted(Payment $payment): Payment
    {
        return DB::transaction(function () use ($payment) {
            $payment->update([
                'status' => 'completed',
                'verified_at' => now(),
            ]);

            // Update order status to confirmed
            $order = $payment->order;
            $order->update(['status' => 'confirmed']);

            // Mark invoice as sent
            $invoice = $order->invoice;
            if ($invoice) {
                $invoice->update(['status' => 'sent']);
            }

            // Log successful payment
            TransactionLog::log(
                $order->user_id,
                'deposit',
                $payment->amount,
                'Payment completed and verified',
                ['payment_id' => $payment->id],
                $order->id,
                $payment->id
            );

            return $payment;
        });
    }

    /**
     * Mark payment as failed.
     */
    public function markAsFailed(Payment $payment, string $reason = ''): Payment
    {
        return DB::transaction(function () use ($payment, $reason) {
            $payment->update([
                'status' => 'failed',
                'notes' => ($payment->notes ?? '') . "\n\nFailed: " . $reason,
            ]);

            // Log failed payment
            TransactionLog::log(
                $payment->user_id,
                'deposit',
                0,
                'Payment failed',
                ['reason' => $reason],
                $payment->order_id,
                $payment->id
            );

            return $payment;
        });
    }

    /**
     * Process refund for payment.
     */
    public function refund(Payment $payment, float $amount = null, string $reason = ''): Payment
    {
        return DB::transaction(function () use ($payment, $amount, $reason) {
            $refundAmount = $amount ?? $payment->amount;

            if ($refundAmount > $payment->amount) {
                throw new \Exception('Refund amount cannot exceed payment amount');
            }

            $payment->update([
                'status' => 'refunded',
                'refunded_amount' => $refundAmount,
                'refunded_at' => now(),
                'notes' => ($payment->notes ?? '') . "\n\nRefunded: " . $reason,
            ]);

            // Log refund transaction
            TransactionLog::log(
                $payment->user_id,
                'order_refund',
                $refundAmount,
                'Payment refunded',
                ['reason' => $reason, 'payment_id' => $payment->id],
                $payment->order_id,
                $payment->id
            );

            return $payment;
        });
    }

    /**
     * Get payment details with related data.
     */
    public function getPaymentDetails(int $paymentId)
    {
        return Payment::with('order', 'user')->findOrFail($paymentId);
    }

    /**
     * Get user's payment history.
     */
    public function getUserPayments(int $userId, array $filters = [])
    {
        $query = Payment::where('user_id', $userId)
            ->with('order');

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['from_date'])) {
            $query->where('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('created_at', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('created_at')->paginate(10);
    }

    /**
     * Get merchant's payment statistics.
     */
    public function getMerchantPaymentStats(int $merchantId): array
    {
        $orders = Order::where('merchant_id', $merchantId)
            ->with('payment')
            ->get();

        return [
            'total_orders' => $orders->count(),
            'paid_orders' => $orders->filter(fn ($o) => $o->payment?->status === 'completed')->count(),
            'pending_payments' => $orders->filter(fn ($o) => $o->payment?->status === 'pending')->count(),
            'failed_payments' => $orders->filter(fn ($o) => $o->payment?->status === 'failed')->count(),
            'total_paid_amount' => $orders
                ->filter(fn ($o) => $o->payment?->status === 'completed')
                ->sum(fn ($o) => $o->total_price),
        ];
    }
}
