export class AuthModel {
  private fastify: FastifyTypeBox;
  private static instance: AuthModel | null = null;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox) {
    if (!AuthModel.instance) {
      AuthModel.instance = new AuthModel(fastify);
    }
    return AuthModel.instance;
  }

  /**
   * Create a new user
   * @param param0 User data for creating a new user
   * @returns The created user
   */
  public createUser({
    email,
    password_hash,
    salt,
    name
  }: {
    email: string;
    password_hash: string;
    salt: string;
    name: string;
  }) {
    return this.fastify.prisma.user.create({
      select: {
        user_id: true,
        email: true,
        name: true,
        created_at: true
      },
      data: {
        email,
        password_hash,
        salt,
        name
      }
    });
  }
}
