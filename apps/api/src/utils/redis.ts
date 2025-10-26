import { FastifyRedis } from '@fastify/redis';

type TokenType = 'jwt';

export class RedisTokenUtils {
  private static instance: RedisTokenUtils | null = null;
  private redisClient: FastifyRedis;

  private constructor(redisClient: FastifyRedis) {
    this.redisClient = redisClient;
  }

  public static getInstance(redisClient: FastifyRedis): RedisTokenUtils {
    if (!RedisTokenUtils.instance) {
      RedisTokenUtils.instance = new RedisTokenUtils(redisClient);
    }
    return RedisTokenUtils.instance;
  }

  /**
   * Set a token with a specific type and TTL
   * @param tokenType The type of the token
   * @param token The token value
   * @param data The data to associate with the token
   * @param ttl Time to live in seconds
   */
  public setToken(tokenType: TokenType, token: string, data: string, ttl: number) {
    const key = `${tokenType}:${token}`;
    return this.redisClient.set(key, data, 'EX', ttl);
  }

  /**
   * Get a token's associated data by its type and value
   * @param tokenType The type of the token
   * @param token The token value
   * @return The associated data or null if not found
   */
  public getToken(tokenType: TokenType, token: string) {
    const key = `${tokenType}:${token}`;
    return this.redisClient.get(key);
  }

  /**
   * Delete a token by its type and value
   * @param tokenType The type of the token
   * @param token The token value
   * @return Number of keys that were removed
   */
  public deleteToken(tokenType: TokenType, token: string) {
    const key = `${tokenType}:${token}`;
    return this.redisClient.del(key);
  }
}
