import { build } from '@tests/helpers/build';

describe('update user password', async () => {
  const app = await build();
  let jwt: string;

  beforeAll(async () => {
    const signup = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-password@test.com',
        password: 'password',
        name: 'User'
      }
    });
    expect(signup.statusCode).toBe(201);

    const signin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-password@test.com',
        password: 'password'
      }
    });
    jwt = signin.json().jwt;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should change password successfully and allow signin with new password', async () => {
    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/password',
      headers: {
        Authorization: `Bearer ${jwt}`
      },
      body: {
        current_password: 'password',
        new_password: 'newpassword'
      }
    });
    expect(res.statusCode).toBe(204);

    // old password should fail
    const oldSignin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-password@test.com',
        password: 'password'
      }
    });
    expect(oldSignin.statusCode).toBe(401);

    const newSignin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-password@test.com',
        password: 'newpassword'
      }
    });

    expect(newSignin.statusCode).toBe(200);
    expect(newSignin.json()).toHaveProperty('jwt');
  });

  it('should return 401 for invalid current password', async () => {
    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/password',
      headers: {
        Authorization: `Bearer ${jwt}`
      },
      body: {
        current_password: 'wrongpwd',
        new_password: 'newpasswd'
      }
    });
    expect(res.statusCode).toBe(401);
  });

  it('should return 404 if user not found', async () => {
    const signup = await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-update-password-to-delete@test.com',
        password: 'password',
        name: 'Del'
      }
    });
    const user = signup.json();
    const signin = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-password-to-delete@test.com',
        password: 'password'
      }
    });
    const jwt2 = signin.json().jwt;

    await app.prisma.user.delete({ where: { user_id: user.user_id } });

    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/password',
      headers: {
        Authorization: `Bearer ${jwt2}`
      },
      body: {
        current_password: 'password',
        new_password: 'whatever'
      }
    });
    expect(res.statusCode).toBe(404);
  });

  it('should return 400 for invalid body', async () => {
    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/password',
      headers: {
        Authorization: `Bearer ${jwt}`
      },
      body: {
        current_password: 'short',
        new_password: 'x'
      }
    });
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 if not authenticated', async () => {
    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/password',
      headers: {
        Authorization: `Bearer invalid-token`
      },
      body: {
        current_password: 'password',
        new_password: 'newpass'
      }
    });
    expect(res.statusCode).toBe(401);
  });

  it('should return 400 for new password that is too short', async () => {
    const res = await app.inject({
      method: 'PUT',
      path: '/user/me/password',
      headers: {
        Authorization: `Bearer ${jwt}`
      },
      body: {
        current_password: 'password',
        new_password: 'short'
      }
    });
    expect(res.statusCode).toBe(400);
  });

  it('should sign out other sessions after password change', async () => {
    // Sign in to create a second session
    const signin2 = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-update-password@test.com',
        password: 'password'
      }
    });
    const jwt2 = signin2.json().jwt;

    // Change password
    await app.inject({
      method: 'PUT',
      path: '/user/me/password',
      headers: {
        Authorization: `Bearer ${jwt}`
      },
      body: {
        current_password: 'password',
        new_password: 'newpassword'
      }
    });

    // Verify that the second session is invalidated
    const protectedResponse = await app.inject({
      method: 'POST',
      path: '/auth/signout',
      headers: {
        Authorization: `Bearer ${jwt2}`
      }
    });

    expect(protectedResponse.statusCode).toBe(401);
  });
});
