import { UserRepository } from './user.repository';
import { Prisma } from '@prisma/client';
import { generateHash, verifyHash } from '@utils/hash';
import { JWTUtils } from '@utils/jwt';

export class UserService {
  private static instance: UserService;
  private userModel: UserRepository;
  private fastify: FastifyTypeBox;
  private redisTokenUtils: JWTUtils;

  private constructor(fastify: FastifyTypeBox, userModel: UserRepository) {
    this.userModel = userModel;
    this.redisTokenUtils = JWTUtils.getInstance(fastify.redis);
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox, userModel = UserRepository.getInstance(fastify)): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService(fastify, userModel);
    }
    return UserService.instance;
  }

  /**
   * Get user information by user ID
   * @param user_id The user ID
   * @returns The user information
   */
  public async getUserInfo(user_id: string) {
    return this.userModel.findUserById(user_id);
  }

  /**
   * Update user's name
   * @param user_id The user ID
   * @param data The fields to update
   */
  public async updateUser(user_id: string, data: { name: string }) {
    try {
      return await this.userModel.updateUser(user_id, data);
    } catch (error) {
      // If user not found, Prisma throws P2025
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update user's email
   * @param user_id The user ID
   * @param email The new email
   */
  public async updateEmail(user_id: string, email: string) {
    try {
      return await this.userModel.updateUserEmail(user_id, email);
    } catch (error) {
      // If user not found, Prisma throws P2025
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      // Rethrow other errors
      throw error;
    }
  }

  /**
   * Change user's password
   * @param user_id The user ID
   * @param currentPassword The current password to verify
   * @param newPassword The new password to set
   * @param currentJWT The current JWT to exclude from revocation
   * @returns true if updated, false if current password invalid, null if user not found
   */
  public async changePassword(user_id: string, currentPassword: string, newPassword: string, currentJWT: string) {
    const user = await this.userModel.findUserById(user_id);
    if (!user) return null;

    const valid = await verifyHash(currentPassword, user.password_hash, user.salt);
    if (!valid) return false;

    const { hash, salt } = await generateHash(newPassword);
    await this.userModel.updateUserPassword(user_id, hash, salt);

    // Sign out other sessions
    await this.redisTokenUtils.revokeAllJWTs(user_id, currentJWT);

    return true;
  }
}
