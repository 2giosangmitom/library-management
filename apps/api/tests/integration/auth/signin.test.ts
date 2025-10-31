import { build } from '@tests/helpers/build';
import * as hashUtils from '@utils/hash';
import { RedisTokenUtils } from '@utils/redis';

describe('sign in', async () => {
  const app = await build();
  const redisTokenUtils = RedisTokenUtils.getInstance(app.redis);

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    // Sign up an account for later usage
    await app.inject({
      method: 'POST',
      path: '/auth/signup',
      body: {
        email: 'test-signin@test.com',
        password: 'password123',
        name: 'Test sign in'
      }
    });
  });

  it('should returns 401 if provide wrong email', async () => {
    const response = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-signin-wrong@test.com',
        password: 'password123'
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      message: 'Invalid email or password'
    });
  });

  it('should returns 401 if provide wrong password', async () => {
    const verifyHashSpy = vi.spyOn(hashUtils, 'verifyHash');

    const response = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-signin@test.com',
        password: 'wrong-password'
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      message: 'Invalid email or password'
    });
    expect(verifyHashSpy).toHaveBeenCalledOnce();
  });

  it('should return 200 status code with jwt if provide correct password', async () => {
    const response = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-signin@test.com',
        password: 'password123'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('jwt');
  });

  it('should store the jwt in redis with proper expiration', async () => {
    const response = await app.inject({
      method: 'POST',
      path: '/auth/signin',
      body: {
        email: 'test-signin@test.com',
        password: 'password123'
      }
    });

    const { jwt } = response.json();
    const decoded = app.jwt.decode<JWTPayload>(jwt);
    expect(decoded).not.toBeNull();
    await expect(redisTokenUtils.getToken('jwt', decoded!.jti)).resolves.toBeDefined();
  });
});
