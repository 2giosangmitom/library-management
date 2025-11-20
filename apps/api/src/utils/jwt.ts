import { type FastifyRedis } from '@fastify/redis';

type TokenType = 'access_token' | 'refresh_token';

/**
 * Utilities for managing JWT tokens in Redis.
 */
export class JWTUtils {
  private static instance: JWTUtils | null = null;
  private redisClient: FastifyRedis;

  /**
   * Creates an instance of JWTUtils.
   * @param redisClient The fastify-redis client instance.
   */
  private constructor(redisClient: FastifyRedis) {
    this.redisClient = redisClient;
  }

  /**
   * Get the singleton instance of JWTUtils.
   * @param redisClient The fastify-redis client instance.
   * @returns The singleton instance of JWTUtils.
   */
  public static getInstance(redisClient: FastifyRedis): JWTUtils {
    if (!JWTUtils.instance) {
      JWTUtils.instance = new JWTUtils(redisClient);
    }
    return JWTUtils.instance;
  }

  /**
   * Stores a JWT token in Redis with an expiration time.
   * @param userId The user ID associated with the token.
   * @param tokenType The type of token.
   * @param token The JWT token to store.
   * @param expiresIn The expiration time in seconds.
   */
  public async storeToken(userId: string, tokenType: TokenType, token: string, expiresIn: number): Promise<void> {
    const key = `${tokenType}:${token}`;
    const setKey = `user_tokens:${tokenType}:${userId}`;
    const pipeline = this.redisClient.pipeline();

    pipeline.set(key, userId, 'EX', expiresIn);
    pipeline.sadd(setKey, key);

    await pipeline.exec();
  }

  /**
   * Get data associated with a JWT token from Redis.
   * @param tokenType The type of token.
   * @param token The JWT token to retrieve data for.
   * @returns The user ID associated with the token, or null if not found.
   */
  public async getTokenData(tokenType: TokenType, token: string): Promise<string | null> {
    const key = `${tokenType}:${token}`;
    const userId = await this.redisClient.get(key);

    return userId;
  }

  /**
   * Deletes a JWT token from Redis.
   * @param tokenType The type of token.
   * @param token The JWT token to delete.
   * @param userId The user ID associated with the token.
   */
  public async deleteToken(tokenType: TokenType, token: string, userId: string): Promise<void> {
    const key = `${tokenType}:${token}`;
    const setKey = `user_tokens:${tokenType}:${userId}`;
    const pipeline = this.redisClient.pipeline();

    pipeline.del(key);
    pipeline.srem(setKey, key);

    await pipeline.exec();
  }

  /**
   * Deletes all tokens of a specific type for a user.
   * @param tokenType The type of tokens to delete.
   * @param userId The user ID whose tokens are to be deleted.
   * @param ignores An optional set of token keys to ignore during deletion.
   */
  public async deleteAllTokens(tokenType: TokenType, userId: string, ignores?: Set<string>): Promise<void> {
    const setKey = `user_tokens:${tokenType}:${userId}`;
    const tokens = await this.redisClient.smembers(setKey);
    const tokensToDelete = tokens.filter((tokenKey) => !ignores || !ignores.has(tokenKey));
    const pipeline = this.redisClient.pipeline();

    pipeline.del(tokensToDelete);
    pipeline.srem(setKey, tokensToDelete);

    await pipeline.exec();
  }
}
