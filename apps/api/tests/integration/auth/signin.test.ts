import { build } from '@tests/helpers/fastify';
import { RedisTokenUtils } from '@utils/redis';
import { createUser } from '@tests/helpers/user';
import { faker } from '@faker-js/faker';

const ENDPOINT = '/auth/signin';

describe(`POST ${ENDPOINT}`, async () => {
  const app = await build();
  const redisTokenUtils = RedisTokenUtils.getInstance(app.redis);
  let signedUpUser: Awaited<ReturnType<typeof createUser>>;

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    // Sign up an account for later usage
    signedUpUser = await createUser(app, 'Test sign in', 'password123');
  });

  it('should returns 401 if provide wrong email', async () => {
    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: faker.internet.email({ firstName: 'Nonexistent', lastName: 'User' }),
        password: 'password123'
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "message": "Invalid email or password",
      }
    `);
  });

  it('should returns 401 if provide wrong password', async () => {
    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: signedUpUser.email,
        password: 'wrong-password'
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "message": "Invalid email or password",
      }
    `);
  });

  it('should return 200 status code with jwt if provide correct password', async () => {
    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: signedUpUser.email,
        password: 'password123'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('jwt');
  });

  it('should return 400 if the email is invalid', async () => {
    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: 'invalid-email',
        password: 'password123'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body/email must match format "email"",
        "statusCode": 400,
      }
    `);
  });

  it('should return 400 if the password is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: signedUpUser.email
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body must have required properties password",
        "statusCode": 400,
      }
    `);
  });

  it('should return 400 if the password is too short', async () => {
    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: signedUpUser.email,
        password: faker.internet.password({ length: 3 })
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "code": "FST_ERR_VALIDATION",
        "error": "Bad Request",
        "message": "body/password must not have fewer than 8 characters",
        "statusCode": 400,
      }
    `);
  });

  it('should store the jwt in redis with proper expiration', async () => {
    const redisTokenUtilsSpy = vi.spyOn(redisTokenUtils, 'addJWT');

    const response = await app.inject({
      method: 'POST',
      path: ENDPOINT,
      body: {
        email: signedUpUser.email,
        password: 'password123'
      }
    });

    const decoded = app.jwt.decode<JWTPayload>(response.json().jwt);
    assert.isNotNull(decoded);
    await expect(redisTokenUtils.getJWT(decoded.jti)).resolves.toBeDefined();
    expect(redisTokenUtilsSpy).toHaveBeenCalledWith(decoded.jti, decoded.sub, 30 * 24 * 60 * 60);
  });
});
