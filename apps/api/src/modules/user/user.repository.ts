import { Role } from '@prisma/client';

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
      where: {
        email
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true
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
      where: {
        user_id
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  /**
   * Update user information
   * @param user_id The user ID
   * @param data Fields to update
   */
  public async updateUser(
    user_id: string,
    data: {
      name?: string;
      role?: Role;
      email?: string;
      password_hash?: string;
      salt?: string;
    }
  ) {
    return this.fastify.prisma.user.update({
      where: {
        user_id
      },
      select: {
        user_id: true,
        email: true,
        name: true,
        role: true,
        updated_at: true
      },
      data
    });
  }

  /**
   * Get user's password hash and salt by email
   * @param email The email address
   * @returns The password hash and salt
   */
  public async getUserCredentialsByEmail(email: string) {
    return this.fastify.prisma.user.findUnique({
      where: {
        email
      },
      select: {
        password_hash: true,
        salt: true
      }
    });
  }

  /**
   * Find all users with pagination
   * @param page The page number
   * @param pageSize The number of users per page
   * @returns List of users
   */
  public async findAllUsers(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return this.fastify.prisma.$transaction([
      this.fastify.prisma.user.count(),
      this.fastify.prisma.user.findMany({
        skip,
        take: pageSize,
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      })
    ]);
  }
}
