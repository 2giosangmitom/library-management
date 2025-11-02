import { UserModel } from './user.model';
import { Prisma } from '@prisma/client';

export class UserService {
  private static instance: UserService;
  private userModel: UserModel;

  private constructor(userModel: UserModel) {
    this.userModel = userModel;
  }

  public static getInstance(fastify: FastifyTypeBox, userModel = UserModel.getInstance(fastify)) {
    if (!UserService.instance) {
      UserService.instance = new UserService(userModel);
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
}
