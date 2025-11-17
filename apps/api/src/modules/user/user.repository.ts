export class UserRepository {
  private fastify: FastifyTypeBox;
  private static instance: UserRepository | null = null;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox) {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository(fastify);
    }
    return UserRepository.instance;
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
        role: true,
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

  /**
   * Update a user's email by ID
   * @param user_id The user ID
   * @param email The new email
   */
  public updateUserEmail(user_id: string, email: string) {
    return this.fastify.prisma.user.update({
      where: { user_id },
      data: { email },
      select: {
        user_id: true,
        email: true,
        name: true,
        role: true,
        updated_at: true
      }
    });
  }

  /**
   * Update a user's password by ID
   * @param user_id The user ID
   * @param password_hash The new password hash
   * @param salt The new salt
   */
  public updateUserPassword(user_id: string, password_hash: string, salt: string) {
    return this.fastify.prisma.user.update({
      where: { user_id },
      data: { password_hash, salt },
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
