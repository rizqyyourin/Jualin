<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;

class InvoiceService
{
    /**
     * Generate invoice for an order.
     */
    public function generate(Order $order): Invoice
    {
        // Ensure order items are loaded
        $order->load('orderItems.product');
        
        // Calculate totals
        $subtotal = $order->orderItems->sum(function ($item) {
            return $item->unit_price * $item->quantity;
        });

        $discount = 0;
        if ($order->couponUsage) {
            $discount = $order->couponUsage->discount_amount;
        }

        $tax = $subtotal * 0.1; // 10% tax
        $shipping = $order->shipping_cost ?? 0;
        $total = $subtotal - $discount + $tax + $shipping;

        $invoice = Invoice::create([
            'order_id' => $order->id,
            'merchant_id' => $order->merchant_id,
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'status' => 'draft',
            'subtotal' => $subtotal,
            'tax' => $tax,
            'discount' => $discount,
            'shipping_cost' => $shipping,
            'total' => $total,
            'issue_date' => now(),
            'due_date' => now()->addDays(7),
            'items' => $order->orderItems->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'price' => $item->unit_price,
                    'subtotal' => $item->unit_price * $item->quantity,
                ];
            })->toArray(),
            'notes' => 'Invoice for order #' . $order->id,
        ]);

        return $invoice;
    }

    /**
     * Mark invoice as sent.
     */
    public function markAsSent(Invoice $invoice): Invoice
    {
        $invoice->update(['status' => 'sent']);
        return $invoice;
    }

    /**
     * Mark invoice as paid.
     */
    public function markAsPaid(Invoice $invoice): Invoice
    {
        $invoice->markAsPaid();
        return $invoice;
    }

    /**
     * Cancel invoice.
     */
    public function cancel(Invoice $invoice, string $reason = ''): Invoice
    {
        $invoice->update([
            'status' => 'cancelled',
            'notes' => ($invoice->notes ?? '') . "\n\nCancelled: " . $reason,
        ]);
        return $invoice;
    }

    /**
     * Mark invoice as overdue.
     */
    public function markAsOverdue(Invoice $invoice): Invoice
    {
        $invoice->update(['status' => 'overdue']);
        return $invoice;
    }

    /**
     * Get invoices by merchant.
     */
    public function getMerchantInvoices(int $merchantId, array $filters = [])
    {
        $query = Invoice::where('merchant_id', $merchantId);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['from_date'])) {
            $query->where('issue_date', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('issue_date', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('issue_date')->paginate(15);
    }

    /**
     * Calculate invoice statistics for merchant.
     */
    public function getMerchantStats(int $merchantId): array
    {
        $invoices = Invoice::where('merchant_id', $merchantId)->get();

        return [
            'total_invoices' => $invoices->count(),
            'paid_invoices' => $invoices->where('status', 'paid')->count(),
            'pending_invoices' => $invoices->whereIn('status', ['draft', 'sent'])->count(),
            'overdue_invoices' => $invoices->where('status', 'overdue')->count(),
            'total_revenue' => $invoices->where('status', 'paid')->sum('total'),
            'pending_amount' => $invoices->whereIn('status', ['sent', 'overdue'])->sum('total'),
        ];
    }
}
