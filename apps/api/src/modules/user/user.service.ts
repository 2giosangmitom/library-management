import { UserModel } from './user.model';

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
}
