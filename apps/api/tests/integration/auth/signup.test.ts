import { build } from '@tests/helpers/build';

describe('sign up', async () => {
  const app = await build();

  afterAll(async () => {
    await app.close();
  });

  it('should sign up a new user if data is valid', async () => {
    const response = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-signup@test.com',
        password: 'test-signup-password',
        name: 'Test Signup'
      }
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('user_id');
    expect(body).toHaveProperty('email', 'test-signup@test.com');
    expect(body).toHaveProperty('name', 'Test Signup');
  });

  it('should return 409 if email is already in use', async () => {
    // First, sign up a user
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-signup2@test.com',
        password: 'test-signup-password',
        name: 'Test Signup'
      }
    });

    // Try to sign up again with the same email
    const response = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-signup2@test.com',
        password: 'test-signup-password',
        name: 'Test Signup'
      }
    });

    expect(response.statusCode).toBe(409);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('message', 'Email already exists');
  });
});
