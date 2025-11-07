import { build } from '@tests/helpers/fastify';

describe('update user email', async () => {
  const app = await build();
  let jwt: string;

  beforeAll(async () => {
    const signup = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-email@test.com',
        password: 'password',
        name: 'User'
      }
    });
    expect(signup.statusCode).toBe(201);

    const signin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-email@test.com',
        password: 'password'
      }
    });
    jwt = signin.json().jwt;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update email successfully', async () => {
    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/email',
      headers: {
        Authorization: `Bearer ${jwt}`
      },
      body: {
        email: 'test-update-email-changed@test.com'
      }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.email).toBe('test-update-email-changed@test.com');
    expect(body).toHaveProperty('updated_at');
  });

  it('should return 409 if email is already in use', async () => {
    // create another user with target email
    const signup = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-email-exists@test.com',
        password: 'password',
        name: 'Other'
      }
    });
    expect(signup.statusCode).toBe(201);

    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/email',
      headers: { Authorization: `Bearer ${jwt}` },
      body: {
        email: 'test-update-email-exists@test.com'
      }
    });
    expect(res.statusCode).toBe(409);
  });

  it('should return 404 if user not found', async () => {
    // sign up another, sign in, delete directly and attempt update
    const signup = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-email-to-delete@test.com',
        password: 'password',
        name: 'Del'
      }
    });
    const user = signup.json();
    const signin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-email-to-delete@test.com',
        password: 'password'
      }
    });
    const jwt2 = signin.json().jwt;

    await app.prisma.user.delete({ where: { user_id: user.user_id } });

    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/email',
      headers: {
        Authorization: `Bearer ${jwt2}`
      },
      body: {
        email: 'x@test.com'
      }
    });
    expect(res.statusCode).toBe(404);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/email',
      headers: {
        Authorization: `Bearer ${jwt}`
      },
      body: {
        email: 'invalid-email-format'
      }
    });
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 if not authenticated', async () => {
    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/email',
      headers: {
        Authorization: `Bearer invalid-token`
      },
      body: {
        email: 'x@test.com'
      }
    });
    expect(res.statusCode).toBe(401);
  });
});
