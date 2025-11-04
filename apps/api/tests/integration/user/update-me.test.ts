import { build } from '@tests/helpers/build';

describe('update user me', async () => {
  const app = await build();
  let jwt: string;

  beforeAll(async () => {
    const signup = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-me@test.com',
        password: 'password',
        name: 'Old Name'
      }
    });
    expect(signup.statusCode).toBe(201);

    const signin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-me@test.com',
        password: 'password'
      }
    });
    jwt = signin.json().jwt;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update the authenticated user name', async () => {
    const response = await app.inject({
      method: 'PUT',
      path: '/user/me',
      headers: {
        Authorization: `Bearer ${jwt}`
      },
      body: {
        name: 'New Name'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.name).toBe('New Name');
    expect(body.email).toBe('test-update-me@test.com');
    expect(body).toHaveProperty('updated_at');
  });

  it('should return 404 if user no longer exists', async () => {
    // create and sign in another user
    const signup = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-me-delete@test.com',
        password: 'password',
        name: 'To Delete'
      }
    });
    const user = signup.json();
    const signin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-me-delete@test.com',
        password: 'password'
      }
    });
    const jwt2 = signin.json().jwt;

    // delete user directly
    await app.prisma.user.delete({ where: { user_id: user.user_id } });

    const response = await app.inject({
      method: 'PUT',
      path: '/user/me',
      headers: {
        Authorization: `Bearer ${jwt2}`
      },
      body: {
        name: 'X'
      }
    });
    expect(response.statusCode).toBe(404);
  });
});
