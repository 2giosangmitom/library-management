import { build } from '@tests/helpers/build';

describe('sign out', async () => {
  const app = await build();

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    // Sign up an account for later usage
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-signout@test.com',
        password: 'password123',
        name: 'Test sign out'
      }
    });
  });

  it('should sign out successfully and invalidate the JWT', async () => {
    // Sign in to get JWT
    const signInResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-signout@test.com',
        password: 'password123'
      }
    });

    expect(signInResponse.statusCode).toBe(200);
    const { jwt } = signInResponse.json();
    expect(jwt).toBeDefined();

    // Sign out using the obtained JWT
    const signOutResponse = await app.inject({
      method: 'POST',
      path: '/auth/signout',
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    expect(signOutResponse.statusCode).toBe(204);

    // Try to access a protected route with the same JWT to verify it's invalidated
    const protectedResponse = await app.inject({
      method: 'POST',
      path: '/auth/signout',
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    expect(protectedResponse.statusCode).toBe(401);
  });

  it('should return 401 if no JWT provided', async () => {
    const response = await app.inject({
      method: 'POST',
      path: '/auth/signout'
    });

    expect(response.statusCode).toBe(401);
  });
});
