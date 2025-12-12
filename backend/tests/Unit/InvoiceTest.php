<?php

namespace Tests\Unit;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $merchant;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customer = User::factory()->create(['role' => 'customer']);
        $this->merchant = User::factory()->create(['role' => 'merchant']);
    }

    /** @test */
    public function invoice_can_be_created()
    {
        $invoice = Invoice::factory()->create([
            'merchant_id' => $this->merchant->id,
        ]);

        $this->assertNotNull($invoice);
        $this->assertEquals($this->merchant->id, $invoice->merchant_id);
    }

    /** @test */
    public function invoice_generates_unique_number()
    {
        // Create first invoice to establish the sequence
        $invoice1 = Invoice::factory()->create([
            'merchant_id' => $this->merchant->id,
        ]);
        
        // Create second invoice
        $invoice2 = Invoice::factory()->create([
            'merchant_id' => $this->merchant->id,
        ]);

        $this->assertNotEquals($invoice1->invoice_number, $invoice2->invoice_number);
        $this->assertStringStartsWith('INV-', $invoice1->invoice_number);
        $this->assertStringStartsWith('INV-', $invoice2->invoice_number);
    }

    /** @test */
    public function invoice_has_correct_format()
    {
        $invoiceNumber = Invoice::generateInvoiceNumber();

        // Format: INV-YYYYMMDD-######
        $this->assertMatchesRegularExpression('/^INV-\d{8}-\d{6}$/', $invoiceNumber);
    }

    /** @test */
    public function invoice_can_be_marked_as_paid()
    {
        $invoice = Invoice::factory()->create([
            'merchant_id' => $this->merchant->id,
            'status' => 'draft',
        ]);

        $invoice->update(['status' => 'paid', 'paid_date' => now()]);

        $this->assertEquals('paid', $invoice->status);
        $this->assertNotNull($invoice->paid_date);
    }

    /** @test */
    public function invoice_stores_items_as_json()
    {
        $items = [
            ['product_id' => 1, 'product_name' => 'Product 1', 'quantity' => 2, 'price' => 100000],
            ['product_id' => 2, 'product_name' => 'Product 2', 'quantity' => 1, 'price' => 50000],
        ];

        $invoice = Invoice::factory()->create([
            'merchant_id' => $this->merchant->id,
            'items' => $items,
        ]);

        $this->assertIsArray($invoice->items);
        $this->assertEquals(2, count($invoice->items));
    }

    /** @test */
    public function invoice_has_relationship_to_merchant()
    {
        $invoice = Invoice::factory()->create(['merchant_id' => $this->merchant->id]);

        $this->assertNotNull($invoice->merchant());
        $this->assertEquals($this->merchant->id, $invoice->merchant->id);
    }

    /** @test */
    public function invoice_has_correct_total_calculation()
    {
        $subtotal = 100000;
        $tax = 10000;
        $discount = 5000;
        $shipping = 20000;
        $total = $subtotal + $tax - $discount + $shipping;

        $invoice = Invoice::factory()->create([
            'merchant_id' => $this->merchant->id,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'discount' => $discount,
            'shipping_cost' => $shipping,
            'total' => $total,
        ]);

        $this->assertEquals($total, $invoice->total);
    }

    /** @test */
    public function invoice_can_transition_through_statuses()
    {
        $invoice = Invoice::factory()->create([
            'merchant_id' => $this->merchant->id,
            'status' => 'draft',
        ]);

        $statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
        foreach ($statuses as $status) {
            $invoice->update(['status' => $status]);
            $this->assertEquals($status, $invoice->status);
        }
    }
}
