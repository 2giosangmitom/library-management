import type UserService from './services';
import type { GetMeSchema } from './schemas';

export default class UserController {
  private userService: UserService;

  public constructor({ userService }: { userService: UserService }) {
    this.userService = userService;
  }

  public async getMe(req: FastifyRequestTypeBox<typeof GetMeSchema>, reply: FastifyReplyTypeBox<typeof GetMeSchema>) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const user = req.user as AccessToken;

    const data = await this.userService.getUserById(user.sub);

    return reply.status(200).send({
      message: 'User profile retrieved successfully',
      data: {
        ...data,
        created_at: data.created_at.toISOString(),
        updated_at: data.updated_at.toISOString()
      }
    });
  }
}
