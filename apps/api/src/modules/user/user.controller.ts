import { getUserInfoSchema } from './user.schema';
import { UserService } from './user.service';
import { updateUserSchema } from './user.schema';

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
}
