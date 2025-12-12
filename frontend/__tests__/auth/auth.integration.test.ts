/**
 * Auth Integration Tests
 * Testing login and signup with actual API endpoints
 */

const API_URL = 'http://localhost:8000/api';

// Test user data
const testUser = {
  name: 'Test User',
  email: `test.user.${Date.now()}@example.com`,
  password: 'TestPassword123',
};

describe('Auth Integration Tests', () => {
  // Test 1: User Registration
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
          password_confirmation: testUser.password,
        }),
      });

      expect(response.status).toBe(200 | 201);

      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.name).toBe(testUser.name);

      console.log('✓ Registration successful');
      console.log('  Token:', data.token.substring(0, 20) + '...');
      console.log('  User:', data.user);
    });

    it('should fail with invalid email', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test',
          email: 'invalid-email',
          password: 'TestPassword123',
          password_confirmation: 'TestPassword123',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      const data = await response.json();
      expect(data).toHaveProperty('message');

      console.log('✓ Invalid email rejected');
    });

    it('should fail with existing email', async () => {
      // First registration
      await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'User One',
          email: 'duplicate@test.com',
          password: 'TestPassword123',
          password_confirmation: 'TestPassword123',
        }),
      });

      // Try duplicate registration
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'User Two',
          email: 'duplicate@test.com',
          password: 'TestPassword123',
          password_confirmation: 'TestPassword123',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      console.log('✓ Duplicate email rejected');
    });

    it('should fail with password mismatch', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test',
          email: `test.${Date.now()}@example.com`,
          password: 'TestPassword123',
          password_confirmation: 'DifferentPassword123',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      console.log('✓ Password mismatch rejected');
    });
  });

  // Test 2: User Login
  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // First create a test user
      const testEmail = `login.test.${Date.now()}@example.com`;
      const testPassword = 'LoginTest123';

      await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'Login Test User',
          email: testEmail,
          password: testPassword,
          password_confirmation: testPassword,
        }),
      });

      // Now try to login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(testEmail);

      console.log('✓ Login successful');
      console.log('  Token:', data.token.substring(0, 20) + '...');
    });

    it('should fail with invalid email', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'SomePassword123',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      const data = await response.json();
      expect(data).toHaveProperty('message');

      console.log('✓ Non-existent user rejected');
    });

    it('should fail with wrong password', async () => {
      // Create user first
      const testEmail = `wrongpass.test.${Date.now()}@example.com`;

      await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'Wrong Pass Test',
          email: testEmail,
          password: 'CorrectPassword123',
          password_confirmation: 'CorrectPassword123',
        }),
      });

      // Try login with wrong password
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword123',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      console.log('✓ Wrong password rejected');
    });
  });

  // Test 3: Protected Routes
  describe('Protected Routes with Token', () => {
    let authToken: string;
    let userId: number;

    beforeAll(async () => {
      // Create and login a test user
      const testEmail = `protected.test.${Date.now()}@example.com`;
      const testPassword = 'ProtectedTest123';

      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'Protected Test User',
          email: testEmail,
          password: testPassword,
          password_confirmation: testPassword,
        }),
      });

      const registerData = await registerResponse.json();
      authToken = registerData.token;
      userId = registerData.user.id;
    });

    it('should access /api/auth/me with valid token', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.id).toBe(userId);

      console.log('✓ Protected route accessible with token');
    });

    it('should fail without token on protected route', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      console.log('✓ Protected route denied without token');
    });

    it('should fail with invalid token on protected route', async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer invalid.token.here',
        },
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      console.log('✓ Protected route denied with invalid token');
    });
  });

  // Test 4: Logout
  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      // Create and login a test user
      const testEmail = `logout.test.${Date.now()}@example.com`;
      const testPassword = 'LogoutTest123';

      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'Logout Test User',
          email: testEmail,
          password: testPassword,
          password_confirmation: testPassword,
        }),
      });

      const registerData = await registerResponse.json();
      const authToken = registerData.token;

      // Now logout
      const logoutResponse = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(logoutResponse.status).toBe(200);
      console.log('✓ Logout successful');
    });
  });
});

// Run tests
export function runAuthTests() {
  console.log('\n========== Running Auth Integration Tests ==========\n');
  
  // Note: In a real test environment, you would use Jest or another test runner
  // This is a simple demonstration of how the tests would be structured
  
  console.log('To run these tests, use Jest:');
  console.log('npm test -- __tests__/auth/auth.integration.test.ts\n');
}
