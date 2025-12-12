<?php

namespace Tests\Feature\Feature;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test user registration with merchant role
     */
    public function test_user_can_register_as_merchant(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Merchant',
            'email' => 'merchant@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'merchant',
            'phone' => '0812345678',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'status',
            'message',
            'data' => [
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role',
                    'is_active',
                ],
                'access_token',
                'token_type',
            ],
        ]);
        $response->assertJson([
            'status' => 'success',
            'data' => [
                'user' => [
                    'email' => 'merchant@example.com',
                    'role' => 'merchant',
                ],
                'token_type' => 'Bearer',
            ],
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'merchant@example.com',
            'role' => 'merchant',
        ]);

        $this->assertDatabaseHas('user_profiles', [
            'phone' => '0812345678',
        ]);
    }

    /**
     * Test user registration with customer role
     */
    public function test_user_can_register_as_customer(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Jane Customer',
            'email' => 'customer@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'customer',
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'status' => 'success',
            'data' => [
                'user' => [
                    'email' => 'customer@example.com',
                    'role' => 'customer',
                ],
            ],
        ]);
    }

    /**
     * Test registration validation - missing required fields
     */
    public function test_registration_fails_with_missing_fields(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            // Missing email, password, role
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'message',
            'errors' => [
                'email',
                'password',
                'role',
            ],
        ]);
    }

    /**
     * Test registration fails with invalid email
     */
    public function test_registration_fails_with_invalid_email(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'customer',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * Test registration fails with duplicate email
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        User::create([
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'customer',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * Test registration fails with password mismatch
     */
    public function test_registration_fails_with_password_mismatch(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different_password',
            'role' => 'customer',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    /**
     * Test user can login with correct credentials
     */
    public function test_user_can_login(): void
    {
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        UserProfile::create([
            'user_id' => $user->id,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'email' => 'john@example.com',
                    'role' => 'customer',
                ],
                'token_type' => 'Bearer',
            ],
        ]);
        $response->assertJsonStructure([
            'data' => [
                'access_token',
            ],
        ]);
    }

    /**
     * Test login fails with invalid email
     */
    public function test_login_fails_with_invalid_email(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'status' => 'error',
            'message' => 'Invalid credentials',
        ]);
    }

    /**
     * Test login fails with wrong password
     */
    public function test_login_fails_with_wrong_password(): void
    {
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'status' => 'error',
            'message' => 'Invalid credentials',
        ]);
    }

    /**
     * Test login fails for inactive user
     */
    public function test_login_fails_for_inactive_user(): void
    {
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'status' => 'error',
            'message' => 'User account is inactive',
        ]);
    }

    /**
     * Test authenticated user can get profile
     */
    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        UserProfile::create([
            'user_id' => $user->id,
            'phone' => '0812345678',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/me');

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'data' => [
                'id' => $user->id,
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ],
        ]);
    }

    /**
     * Test unauthenticated user cannot get profile
     */
    public function test_unauthenticated_user_cannot_get_profile(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
        $response->assertJson([
            'message' => 'Unauthenticated.',
        ]);
    }

    /**
     * Test user can logout
     */
    public function test_user_can_logout(): void
    {
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/logout');

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'message' => 'Logout successful',
        ]);

        // Verify token count is reduced
        $this->assertCount(0, $user->tokens);
    }

    /**
     * Test user can refresh token
     */
    public function test_user_can_refresh_token(): void
    {
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        $oldToken = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $oldToken")
            ->postJson('/api/auth/refresh');

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'message' => 'Token refreshed successfully',
        ]);
        $response->assertJsonStructure([
            'data' => [
                'access_token',
                'token_type',
            ],
        ]);

        // Verify old token is deleted and new token is created
        $this->assertCount(1, $user->tokens);
        $newToken = $response->json('data.access_token');
        $this->assertNotEquals($oldToken, $newToken);
    }

    /**
     * Test login validation - missing fields
     */
    public function test_login_validation_missing_fields(): void
    {
        $response = $this->postJson('/api/auth/login', [
            // Missing email and password
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);
    }
}
