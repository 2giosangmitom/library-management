export class UserModel {
  private fastify: FastifyTypeBox;
  private static instance: UserModel | null = null;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox) {
    if (!UserModel.instance) {
      UserModel.instance = new UserModel(fastify);
    }
    return UserModel.instance;
  }

  /**
   * Create a new user
   * @param data User data for creating a new user
   * @returns The created user
   */
  public createUser(data: { email: string; password_hash: string; salt: string; name: string }) {
    return this.fastify.prisma.user.create({
      select: {
        user_id: true,
        email: true,
        name: true,
        created_at: true
      },
      data
    });
  }

  /**
   * Find a user by email
   * @param email The email address to find
   * @returns The user data
   */
  public findUserByEmail(email: string) {
    return this.fastify.prisma.user.findUnique({
      select: {
        user_id: true,
        password_hash: true,
        salt: true,
        name: true,
        email: true,
        role: true
      },
      where: {
        email
      }
    });
  }
}
