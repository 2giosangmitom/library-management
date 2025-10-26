import { FastifyRedis } from '@fastify/redis';
import { RedisTokenUtils } from '@utils/redis';

describe('RedisTokenUtils', () => {
  const redisClient = {} as unknown as FastifyRedis;
  const redisTokenUtils = RedisTokenUtils.getInstance(redisClient);

  it('should set a token with correct key and TTL', async () => {
    redisClient.set = vi.fn();

    const tokenType = 'jwt';
    const token = 'sample-token';
    const data = 'sample-data';
    const ttl = 3600;

    await redisTokenUtils.setToken(tokenType, token, data, ttl);

    expect(redisClient.set).toHaveBeenCalledWith(`${tokenType}:${token}`, data, 'EX', ttl);
  });

  it('should get a token with correct key', async () => {
    redisClient.get = vi.fn();

    const tokenType = 'jwt';
    const token = 'reset-token';

    await redisTokenUtils.getToken(tokenType, token);

    expect(redisClient.get).toHaveBeenCalledWith(`${tokenType}:${token}`);
  });

  it('should delete a token with correct key', async () => {
    redisClient.del = vi.fn();

    const tokenType = 'jwt';
    const token = 'verify-token';

    await redisTokenUtils.deleteToken(tokenType, token);

    expect(redisClient.del).toHaveBeenCalledWith(`${tokenType}:${token}`);
  });
});
