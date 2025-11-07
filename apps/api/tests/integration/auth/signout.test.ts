import { build } from '@tests/helpers/fastify';
import { createUser } from '@tests/helpers/user';

const ENDPOINT = '/auth/signout';

describe(`POST ${ENDPOINT}`, async () => {
  const app = await build();
  let signedUpUser: Awaited<ReturnType<typeof createUser>>;

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    // Sign up an account for later usage
    signedUpUser = await createUser(app, 'Test sign out', 'password123');
  });

  it('should sign out successfully and invalidate the JWT', async () => {
    // Sign in to get JWT
    const signInResponse = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: signedUpUser.email,
        password: 'password123'
      }
    });

    expect(signInResponse.statusCode).toBe(200);
    const { jwt } = signInResponse.json();
    assert.isString(jwt);

    // Sign out using the obtained JWT
    const signOutResponse = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    assert.equal(signOutResponse.statusCode, 204);

    // Try to access a protected route with the same JWT to verify it's invalidated
    const protectedResponse = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    expect(protectedResponse.statusCode).toBe(401);
    expect(protectedResponse.json()).toMatchInlineSnapshot(`
      {
        "message": "Untrusted authorization token",
      }
    `);
  });

  it('should return 401 if no JWT provided', async () => {
    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "message": "No Authorization was found in request.headers",
      }
    `);
  });
});
