import { FastifyRedis } from '@fastify/redis';

export class RedisTokenUtils {
  private static instance: RedisTokenUtils;
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
   * Add a JWT to Redis with expiration
   * @param token The JWT token
   * @param user_id The user ID associated with the token
   * @param ttl Time to live in seconds
   * @returns The result of the Redis set operation
   */
  public async addJWT(token: string, user_id: string, ttl: number) {
    const jwtKey = `jwt:${token}`;

    // Also add the token to a set for the user to allow for easy revocation
    await this.redisClient.sadd(`user:${user_id}:jwts`, jwtKey);

    return this.redisClient.set(jwtKey, user_id, 'EX', ttl);
  }

  /**
   * Get a JWT from Redis
   * @param token The JWT token
   * @returns The user ID associated with the token or null if not found
   */
  public async getJWT(token: string) {
    const jwtKey = `jwt:${token}`;
    return this.redisClient.get(jwtKey);
  }

  /**
   * Delete a JWT from Redis
   * @param token The JWT token
   * @returns The number of keys that were removed
   */
  public async deleteJWT(token: string) {
    const jwtKey = `jwt:${token}`;
    return this.redisClient.del(jwtKey);
  }

  /**
   * Revoke all JWTs for a user
   * @param user_id The user ID
   * @param exceptToken An optional token to exclude from revocation
   */
  public async revokeAllJWTs(user_id: string, exceptToken?: string) {
    const userJwtsKey = `user:${user_id}:jwts`;
    const tokens = await this.redisClient.smembers(userJwtsKey);

    // Use a pipeline to batch delete operations
    const pipeline = this.redisClient.multi();

    for (const tokenKey of tokens) {
      const token = tokenKey.split(':')[1];
      if (token !== exceptToken) {
        pipeline.del(tokenKey);
        pipeline.srem(userJwtsKey, tokenKey);
      }
    }

    return pipeline.exec();
  }
}
