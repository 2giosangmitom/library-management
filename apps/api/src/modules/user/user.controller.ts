import { getUserInfoSchema, updateUserSchema, updateUserEmailSchema, updateUserPasswordSchema } from './user.schema';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';

export class UserController {
  private static instance: UserController;
  private userService: UserService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, userService: UserService) {
    this.fastify = fastify;
    this.userService = userService;
  }

  public static getInstance(fastify: FastifyTypeBox, userService = UserService.getInstance(fastify)) {
    if (!UserController.instance) {
      UserController.instance = new UserController(fastify, userService);
    }
    return UserController.instance;
  }

  /**
   * Get user information by user ID
   * @param user_id The user ID
   * @returns The user information
   */
  public async getUserInfo(
    req: FastifyRequestTypeBox<typeof getUserInfoSchema>,
    reply: FastifyReplyTypeBox<typeof getUserInfoSchema>
  ) {
    const encoded = req.user as JWTPayload;

    const user = await this.userService.getUserInfo(encoded.sub);

    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    return reply.send(user);
  }

  /**
   * Update authenticated user's name
   */
  public async updateUser(
    req: FastifyRequestTypeBox<typeof updateUserSchema>,
    reply: FastifyReplyTypeBox<typeof updateUserSchema>
  ) {
    const encoded = req.user as JWTPayload;

    const updated = await this.userService.updateUser(encoded.sub, req.body);

    if (!updated) {
      return reply.status(404).send({ message: 'User not found' });
    }

    return reply.send({
      ...updated,
      updated_at: updated.updated_at.toISOString()
    });
  }

  /**
   * Update authenticated user's email
   */
  public async updateEmail(
    req: FastifyRequestTypeBox<typeof updateUserEmailSchema>,
    reply: FastifyReplyTypeBox<typeof updateUserEmailSchema>
  ) {
    const encoded = req.user as JWTPayload;

    try {
      const updated = await this.userService.updateEmail(encoded.sub, req.body.email);

      if (!updated) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return reply.send({
        ...updated,
        updated_at: updated.updated_at.toISOString()
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return reply.status(409).send({ message: 'Email already exists' });
      }
      throw error;
    }
  }

  /**
   * Change authenticated user's password
   */
  public async changePassword(
    req: FastifyRequestTypeBox<typeof updateUserPasswordSchema>,
    reply: FastifyReplyTypeBox<typeof updateUserPasswordSchema>
  ) {
    const encoded = req.user as JWTPayload;

    const result = await this.userService.changePassword(
      encoded.sub,
      req.body.current_password,
      req.body.new_password,
      encoded.jti
    );

    if (result === null) {
      return reply.status(404).send({ message: 'User not found' });
    }

    if (result === false) {
      return reply.status(401).send({ message: 'Invalid current password' });
    }

    return reply.status(204).send(null);
  }
}
