import { build } from '@tests/helpers/build';

describe('get user me', async () => {
  const app = await build();

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 and user info for authenticated user', async () => {
    // Sign up a user
    const signup = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-user-me@test.com',
        password: 'password123',
        name: 'Test User'
      }
    });

    expect(signup.statusCode).toBe(201);

    const signin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-user-me@test.com',
        password: 'password123'
      }
    });

    expect(signin.statusCode).toBe(200);
    const jwt = signin.json().jwt;

    const me = await app.inject({
      method: 'GET',
      path: '/user/me',
      headers: { Authorization: `Bearer ${jwt}` }
    });

    expect(me.statusCode).toBe(200);
    const body = me.json();
    expect(body).toHaveProperty('user_id');
    expect(body.email).toBe('test-user-me@test.com');
    expect(body.name).toBe('Test User');
    expect(body).toHaveProperty('role');
  });

  it('should return 404 if user no longer exists', async () => {
    // Sign up another user
    const signup = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-user-me-delete@test.com',
        password: 'password123',
        name: 'Delete User'
      }
    });
    expect(signup.statusCode).toBe(201);
    const user = signup.json();

    const signin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: { email: 'test-user-me-delete@test.com', password: 'password123' }
    });
    const jwt = signin.json().jwt;

    // Delete the user directly from the test db
    await app.prisma.user.delete({ where: { user_id: user.user_id } });

    const response = await app.inject({
      method: 'GET',
      path: '/user/me',
      headers: { Authorization: `Bearer ${jwt}` }
    });

    expect(response.statusCode).toBe(404);
  });

  it('should return 401 if no authentication token is provided', async () => {
    const response = await app.inject({
      method: 'GET',
      path: '/user/me'
    });

    expect(response.statusCode).toBe(401);
  });
});
