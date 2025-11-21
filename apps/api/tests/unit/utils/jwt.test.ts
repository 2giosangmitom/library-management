import { JWTUtils } from '@utils/jwt';
import { buildMockFastify } from '../helpers/mockFastify';

describe('JWTUtils', async () => {
  const app = await buildMockFastify();
  const jwtUtils = JWTUtils.getInstance(app.redis);
  const pipelineMock = app.redis.pipeline();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('storeToken', () => {
    it('should store token in Redis', async () => {
      await jwtUtils.storeToken('user123', 'access_token', 'jwt_token', 3600);

      expect(pipelineMock.set).toHaveBeenCalledOnce();
      expect(pipelineMock.sadd).toHaveBeenCalledOnce();
      expect(pipelineMock.set).toHaveBeenCalledWith('access_token:jwt_token', 'user123', 'EX', 3600);
      expect(pipelineMock.sadd).toHaveBeenCalledWith('user_tokens:access_token:user123', 'access_token:jwt_token');
    });
  });

  describe('getTokenData', () => {
    it('should retrieve token data from Redis', async () => {
      app.redis.get = vi.fn().mockResolvedValueOnce('user123');

      const result = await jwtUtils.getTokenData('access_token', 'jwt_token');

      expect(app.redis.get).toHaveBeenCalledOnce();
      expect(app.redis.get).toHaveBeenCalledWith('access_token:jwt_token');
      expect(result).toBe('user123');
    });

    it('should return null if token not found in Redis', async () => {
      const token = 'non_existent_token';

      app.redis.get = vi.fn().mockResolvedValueOnce(null);

      const result = await jwtUtils.getTokenData('access_token', token);

      expect(app.redis.get).toHaveBeenCalledOnce();
      expect(app.redis.get).toHaveBeenCalledWith(`access_token:${token}`);
      expect(result).toBeNull();
    });
  });

  describe('deleteToken', () => {
    it('should delete token from Redis', async () => {
      await jwtUtils.deleteToken('access_token', 'jwt_token', 'user123');

      expect(pipelineMock.del).toHaveBeenCalledOnce();
      expect(pipelineMock.srem).toHaveBeenCalledOnce();
      expect(pipelineMock.del).toHaveBeenCalledWith('access_token:jwt_token');
      expect(pipelineMock.srem).toHaveBeenCalledWith('user_tokens:access_token:user123', 'access_token:jwt_token');
    });
  });

  describe('deleteAllTokens', () => {
    it('should delete all tokens for a user from Redis', async () => {
      app.redis.smembers = vi.fn().mockResolvedValueOnce(['access_token:jwt_token1', 'access_token:jwt_token2']);
      await jwtUtils.deleteAllTokens('access_token', 'user123');

      expect(app.redis.smembers).toHaveBeenCalledOnce();
      expect(app.redis.smembers).toHaveBeenCalledWith('user_tokens:access_token:user123');
      expect(pipelineMock.del).toHaveBeenCalledTimes(1);
      expect(pipelineMock.del).toHaveBeenCalledWith(['access_token:jwt_token1', 'access_token:jwt_token2']);
      expect(pipelineMock.srem).toHaveBeenCalledOnce();
      expect(pipelineMock.srem).toHaveBeenCalledWith('user_tokens:access_token:user123', [
        'access_token:jwt_token1',
        'access_token:jwt_token2'
      ]);
    });

    it('should delete all tokens except ignored ones for a user from Redis', async () => {
      app.redis.smembers = vi
        .fn()
        .mockResolvedValueOnce(['access_token:jwt_token1', 'access_token:jwt_token2', 'access_token:jwt_token3']);
      const ignores = new Set(['access_token:jwt_token2']);
      await jwtUtils.deleteAllTokens('access_token', 'user123', ignores);

      expect(app.redis.smembers).toHaveBeenCalledOnce();
      expect(app.redis.smembers).toHaveBeenCalledWith('user_tokens:access_token:user123');
      expect(pipelineMock.del).toHaveBeenCalledTimes(1);
      expect(pipelineMock.del).toHaveBeenCalledWith(['access_token:jwt_token1', 'access_token:jwt_token3']);
      expect(pipelineMock.srem).toHaveBeenCalledOnce();
      expect(pipelineMock.srem).toHaveBeenCalledWith('user_tokens:access_token:user123', [
        'access_token:jwt_token1',
        'access_token:jwt_token3'
      ]);
    });
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls to getInstance', () => {
      const instance1 = JWTUtils.getInstance(app.redis);
      const instance2 = JWTUtils.getInstance(app.redis);

      expect(instance1).toBe(instance2);
    });
  });
});
