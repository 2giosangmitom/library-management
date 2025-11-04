import { FastifyRedis } from '@fastify/redis';
import { RedisTokenUtils } from '@utils/redis';

describe('RedisTokenUtils', () => {
  const redisClient = {} as unknown as FastifyRedis;
  const redisTokenUtils = RedisTokenUtils.getInstance(redisClient);

  describe('addJWT', () => {
    it('should add a JWT to Redis with expiration', async () => {
      redisClient.sadd = vi.fn().mockResolvedValue(1);
      redisClient.set = vi.fn().mockResolvedValue('OK');

      const result = await redisTokenUtils.addJWT('test-token', 'user-uuid', 3600);

      expect(redisClient.sadd).toHaveBeenCalledWith('user:user-uuid:jwts', 'jwt:test-token');
      expect(redisClient.set).toHaveBeenCalledWith('jwt:test-token', 'user-uuid', 'EX', 3600);
      expect(result).toBe('OK');
    });
  });

  describe('getJWT', () => {
    it('should get a JWT from Redis', async () => {
      redisClient.get = vi.fn().mockResolvedValue('user-uuid');

      const result = await redisTokenUtils.getJWT('test-token');

      expect(redisClient.get).toHaveBeenCalledWith('jwt:test-token');
      expect(result).toBe('user-uuid');
    });

    it('should return null if JWT not found', async () => {
      redisClient.get = vi.fn().mockResolvedValue(null);

      const result = await redisTokenUtils.getJWT('non-existent-token');

      expect(redisClient.get).toHaveBeenCalledWith('jwt:non-existent-token');
      expect(result).toBeNull();
    });
  });

  describe('deleteJWT', () => {
    it('should delete a JWT from Redis', async () => {
      redisClient.del = vi.fn().mockResolvedValue(1);

      const result = await redisTokenUtils.deleteJWT('test-token');

      expect(redisClient.del).toHaveBeenCalledWith('jwt:test-token');
      expect(result).toBe(1);
    });

    it('should return 0 if JWT not found', async () => {
      redisClient.del = vi.fn().mockResolvedValue(0);

      const result = await redisTokenUtils.deleteJWT('non-existent-token');

      expect(redisClient.del).toHaveBeenCalledWith('jwt:non-existent-token');
      expect(result).toBe(0);
    });
  });

  describe('revokeAllJWTs', () => {
    let pipelineMock: ReturnType<typeof redisClient.multi>;

    beforeEach(() => {
      redisClient.smembers = vi.fn();
      pipelineMock = {
        del: vi.fn(),
        srem: vi.fn(),
        exec: vi.fn()
      } as unknown as ReturnType<typeof redisClient.multi>;
      redisClient.multi = vi.fn().mockReturnValue(pipelineMock);
    });

    it('should revoke all JWTs for a user except the specified token', async () => {
      redisClient.smembers = vi.fn().mockResolvedValue(['jwt:token1', 'jwt:token2', 'jwt:token3']);

      await redisTokenUtils.revokeAllJWTs('user-uuid', 'token2');

      expect(redisClient.smembers).toHaveBeenCalledWith('user:user-uuid:jwts');
      expect(pipelineMock.del).toHaveBeenCalledTimes(2);
      expect(pipelineMock.del).toHaveBeenCalledWith('jwt:token1');
      expect(pipelineMock.srem).toHaveBeenCalledWith('user:user-uuid:jwts', 'jwt:token1');
      expect(pipelineMock.del).toHaveBeenCalledWith('jwt:token3');
      expect(pipelineMock.srem).toHaveBeenCalledWith('user:user-uuid:jwts', 'jwt:token3');
      expect(pipelineMock.del).not.toHaveBeenCalledWith('jwt:token2');
      expect(pipelineMock.srem).not.toHaveBeenCalledWith('user:user-uuid:jwts', 'jwt:token2');
      expect(pipelineMock.exec).toHaveBeenCalled();
    });
  });
});
