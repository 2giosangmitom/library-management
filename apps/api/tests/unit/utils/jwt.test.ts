import { FastifyRedis } from '@fastify/redis';
import { JWTUtils } from '@utils/jwt';

describe('RedisTokenUtils', () => {
  const redisClient = {} as FastifyRedis;
  const redisTokenUtils = JWTUtils.getInstance(redisClient);
  const pipelineMock = {} as ReturnType<FastifyRedis['pipeline']>;

  beforeEach(() => {
    redisClient.set = vi.fn();
    redisClient.sadd = vi.fn();
    redisClient.get = vi.fn();
    redisClient.del = vi.fn();
    redisClient.srem = vi.fn();

    pipelineMock.set = vi.fn().mockReturnThis();
    pipelineMock.sadd = vi.fn().mockReturnThis();
    pipelineMock.del = vi.fn().mockReturnThis();
    pipelineMock.srem = vi.fn().mockReturnThis();
    pipelineMock.exec = vi.fn().mockResolvedValue([]);

    redisClient.pipeline = vi.fn().mockReturnValue(pipelineMock);
  });

  describe('storeToken', () => {
    it('should store token in Redis', async () => {
      await redisTokenUtils.storeToken('user123', 'access_token', 'jwt_token', 3600);

      expect(pipelineMock.set).toHaveBeenCalledOnce();
      expect(pipelineMock.sadd).toHaveBeenCalledOnce();
      expect(pipelineMock.set).toHaveBeenCalledWith('access_token:jwt_token', 'user123', 'EX', 3600);
      expect(pipelineMock.sadd).toHaveBeenCalledWith('user_tokens:access_token:user123', 'access_token:jwt_token');
    });
  });

  describe('getTokenData', () => {
    it('should retrieve token data from Redis', async () => {
      redisClient.get = vi.fn().mockResolvedValueOnce('user123');

      const result = await redisTokenUtils.getTokenData('access_token', 'jwt_token');

      expect(redisClient.get).toHaveBeenCalledOnce();
      expect(redisClient.get).toHaveBeenCalledWith('access_token:jwt_token');
      expect(result).toBe('user123');
    });

    it('should return null if token not found in Redis', async () => {
      const token = 'non_existent_token';

      redisClient.get = vi.fn().mockResolvedValueOnce(null);

      const result = await redisTokenUtils.getTokenData('access_token', token);

      expect(redisClient.get).toHaveBeenCalledOnce();
      expect(redisClient.get).toHaveBeenCalledWith(`access_token:${token}`);
      expect(result).toBeNull();
    });
  });

  describe('deleteToken', () => {
    it('should delete token from Redis', async () => {
      await redisTokenUtils.deleteToken('access_token', 'jwt_token', 'user123');

      expect(pipelineMock.del).toHaveBeenCalledOnce();
      expect(pipelineMock.srem).toHaveBeenCalledOnce();
      expect(pipelineMock.del).toHaveBeenCalledWith('access_token:jwt_token');
      expect(pipelineMock.srem).toHaveBeenCalledWith('user_tokens:access_token:user123', 'access_token:jwt_token');
    });
  });

  describe('deleteAllTokens', () => {
    it('should delete all tokens for a user from Redis', async () => {
      redisClient.smembers = vi.fn().mockResolvedValueOnce(['access_token:jwt_token1', 'access_token:jwt_token2']);
      await redisTokenUtils.deleteAllTokens('access_token', 'user123');

      expect(redisClient.smembers).toHaveBeenCalledOnce();
      expect(redisClient.smembers).toHaveBeenCalledWith('user_tokens:access_token:user123');
      expect(pipelineMock.del).toHaveBeenCalledTimes(1);
      expect(pipelineMock.del).toHaveBeenCalledWith(['access_token:jwt_token1', 'access_token:jwt_token2']);
      expect(pipelineMock.srem).toHaveBeenCalledOnce();
      expect(pipelineMock.srem).toHaveBeenCalledWith('user_tokens:access_token:user123', [
        'access_token:jwt_token1',
        'access_token:jwt_token2'
      ]);
    });

    it('should delete all tokens except ignored ones for a user from Redis', async () => {
      redisClient.smembers = vi
        .fn()
        .mockResolvedValueOnce(['access_token:jwt_token1', 'access_token:jwt_token2', 'access_token:jwt_token3']);
      const ignores = new Set(['access_token:jwt_token2']);
      await redisTokenUtils.deleteAllTokens('access_token', 'user123', ignores);

      expect(redisClient.smembers).toHaveBeenCalledOnce();
      expect(redisClient.smembers).toHaveBeenCalledWith('user_tokens:access_token:user123');
      expect(pipelineMock.del).toHaveBeenCalledTimes(1);
      expect(pipelineMock.del).toHaveBeenCalledWith(['access_token:jwt_token1', 'access_token:jwt_token3']);
      expect(pipelineMock.srem).toHaveBeenCalledOnce();
      expect(pipelineMock.srem).toHaveBeenCalledWith('user_tokens:access_token:user123', [
        'access_token:jwt_token1',
        'access_token:jwt_token3'
      ]);
    });
  });

  describe('singleton behavior', () => {
    it('should return the same instance on multiple calls to getInstance', () => {
      const instance1 = JWTUtils.getInstance(redisClient);
      const instance2 = JWTUtils.getInstance(redisClient);

      expect(instance1).toBe(instance2);
    });
  });
});
