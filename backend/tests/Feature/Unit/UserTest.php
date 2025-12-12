<?php

namespace Tests\Feature\Unit;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user creation
     */
    public function test_user_can_be_created(): void
    {
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'john@example.com',
            'role' => 'customer',
        ]);
    }

    /**
     * Test user can have profile
     */
    public function test_user_has_profile(): void
    {
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $profile = UserProfile::create([
            'user_id' => $user->id,
            'phone' => '0812345678',
        ]);

        $this->assertTrue($user->profile->is($profile));
        $this->assertEquals('0812345678', $user->profile->phone);
    }

    /**
     * Test isMerchant method
     */
    public function test_is_merchant_method(): void
    {
        $merchant = User::create([
            'name' => 'John Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
        ]);

        $customer = User::create([
            'name' => 'Jane Customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $this->assertTrue($merchant->isMerchant());
        $this->assertFalse($customer->isMerchant());
    }

    /**
     * Test isCustomer method
     */
    public function test_is_customer_method(): void
    {
        $merchant = User::create([
            'name' => 'John Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
        ]);

        $customer = User::create([
            'name' => 'Jane Customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $this->assertFalse($merchant->isCustomer());
        $this->assertTrue($customer->isCustomer());
    }

    /**
     * Test isAdmin method
     */
    public function test_is_admin_method(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $customer = User::create([
            'name' => 'Jane Customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($customer->isAdmin());
    }

    /**
     * Test user with merchant role can have shop details
     */
    public function test_merchant_user_can_have_shop_details(): void
    {
        $user = User::create([
            'name' => 'Shop Owner',
            'email' => 'shop@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
        ]);

        $profile = UserProfile::create([
            'user_id' => $user->id,
            'shop_name' => 'My Awesome Shop',
            'shop_slug' => 'my-awesome-shop',
            'shop_description' => 'Selling amazing products',
            'phone' => '0812345678',
        ]);

        $this->assertEquals('My Awesome Shop', $user->profile->shop_name);
        $this->assertEquals('my-awesome-shop', $user->profile->shop_slug);
        $this->assertTrue($user->isMerchant());
    }

    /**
     * Test user is created as active by default
     */
    public function test_user_is_active_by_default(): void
    {
        $user = User::create([
            'name' => 'Active User',
            'email' => 'active@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $this->assertTrue($user->is_active);
    }

    /**
     * Test password is hashed
     */
    public function test_password_is_hashed(): void
    {
        $password = 'plain_password123';
        $user = User::create([
            'name' => 'User',
            'email' => 'user@example.com',
            'password' => $password,
            'role' => 'customer',
        ]);

        $this->assertNotEquals($password, $user->password);
    }

    /**
     * Test user can generate API tokens
     */
    public function test_user_can_generate_api_tokens(): void
    {
        $user = User::create([
            'name' => 'User',
            'email' => 'user@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $token = $user->createToken('test_token');

        $this->assertNotNull($token->plainTextToken);
        $this->assertCount(1, $user->tokens);
    }

    /**
     * Test user can have multiple tokens
     */
    public function test_user_can_have_multiple_tokens(): void
    {
        $user = User::create([
            'name' => 'User',
            'email' => 'user@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $token1 = $user->createToken('token1');
        $token2 = $user->createToken('token2');

        $this->assertCount(2, $user->tokens);
    }

    /**
     * Test soft delete on user
     */
    public function test_user_can_be_soft_deleted(): void
    {
        $user = User::create([
            'name' => 'User',
            'email' => 'user@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $user->delete();

        $this->assertSoftDeleted($user);
        $this->assertNull(User::find($user->id));
        $this->assertNotNull(User::withTrashed()->find($user->id));
    }
}
