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
  public async createUser(data: { email: string; password_hash: string; salt: string; name: string }) {
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
  public async findUserByEmail(email: string) {
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

  /**
   * Find a user by user ID
   * @param user_id The user ID to find
   * @returns The user data
   */
  public async findUserById(user_id: string) {
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
        user_id
      }
    });
  }

  /**
   * Update a user's name by ID
   * @param user_id The user ID
   * @param data Fields to update
   */
  public updateUser(user_id: string, data: { name?: string }) {
    return this.fastify.prisma.user.update({
      where: { user_id },
      data,
      select: {
        user_id: true,
        email: true,
        name: true,
        role: true,
        updated_at: true
      }
    });
  }
}
