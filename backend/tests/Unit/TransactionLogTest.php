<?php

namespace Tests\Unit;

use App\Models\TransactionLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionLogTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function transaction_log_can_be_created()
    {
        $log = TransactionLog::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $this->assertNotNull($log);
        $this->assertEquals($this->user->id, $log->user_id);
    }

    /** @test */
    public function transaction_log_can_be_created_via_static_method()
    {
        TransactionLog::log(
            userId: $this->user->id,
            type: 'deposit',
            amount: 100000,
            description: 'Test transaction',
        );

        $this->assertDatabaseHas('transaction_logs', [
            'user_id' => $this->user->id,
            'type' => 'deposit',
            'amount' => 100000,
        ]);
    }

    /** @test */
    public function transaction_log_stores_metadata_as_json()
    {
        $metadata = ['gateway' => 'stripe', 'transaction_id' => 'txn_123'];

        $log = TransactionLog::factory()->create([
            'user_id' => $this->user->id,
            'metadata' => $metadata,
        ]);

        $this->assertIsArray($log->metadata);
        $this->assertEquals('stripe', $log->metadata['gateway']);
    }

    /** @test */
    public function transaction_log_tracks_balance()
    {
        $log = TransactionLog::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'deposit',
            'amount' => 100000,
            'balance_before' => 0,
            'balance_after' => 100000,
        ]);

        $this->assertEquals(0, $log->balance_before);
        $this->assertEquals(100000, $log->balance_after);
    }

    /** @test */
    public function transaction_log_has_relationship_to_user()
    {
        $log = TransactionLog::factory()->create(['user_id' => $this->user->id]);

        $this->assertNotNull($log->user());
        $this->assertEquals($this->user->id, $log->user->id);
    }

    /** @test */
    public function transaction_log_supports_multiple_types()
    {
        $types = ['deposit', 'withdrawal', 'order_refund', 'commission', 'adjustment'];

        foreach ($types as $type) {
            TransactionLog::factory()->create([
                'user_id' => $this->user->id,
                'type' => $type,
            ]);
        }

        $logs = TransactionLog::where('user_id', $this->user->id)->get();
        $this->assertEquals(5, $logs->count());
    }

    /** @test */
    public function transaction_log_can_be_filtered_by_type()
    {
        TransactionLog::factory(3)->create([
            'user_id' => $this->user->id,
            'type' => 'deposit',
        ]);
        TransactionLog::factory(2)->create([
            'user_id' => $this->user->id,
            'type' => 'withdrawal',
        ]);

        $deposits = TransactionLog::where('type', 'deposit')->count();
        $this->assertEquals(3, $deposits);
    }

    /** @test */
    public function transaction_log_can_calculate_total_amount()
    {
        TransactionLog::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'deposit',
            'amount' => 100000,
        ]);
        TransactionLog::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'withdrawal',
            'amount' => 30000,
        ]);

        $total = TransactionLog::where('user_id', $this->user->id)->sum('amount');
        $this->assertEquals(130000, $total);
    }
}
