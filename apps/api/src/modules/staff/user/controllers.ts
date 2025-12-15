import StaffUserService from './services';
import { GetUsersSchema } from './schemas';

export default class StaffUserController {
  private static instance: StaffUserController;
  private staffUserService: StaffUserService;

  private constructor(fastify: FastifyTypeBox, staffUserService: StaffUserService) {
    this.staffUserService = staffUserService;
  }

  public static getInstance(
    fastify: FastifyTypeBox,
    staffUserService = StaffUserService.getInstance(fastify)
  ): StaffUserController {
    if (!StaffUserController.instance) {
      StaffUserController.instance = new StaffUserController(fastify, staffUserService);
    }
    return StaffUserController.instance;
  }

  public async getUsers(
    req: FastifyRequestTypeBox<typeof GetUsersSchema>,
    reply: FastifyReplyTypeBox<typeof GetUsersSchema>
  ) {
    const { users, total } = await this.staffUserService.getUsers({
      ...req.query,
      page: req.query.page ?? 1,
      limit: req.query.limit ?? 100
    });

    const totalPages = Math.ceil(total / (req.query.limit ?? 100));

    return reply.status(200).send({
      message: 'Users retrieved successfully',
      meta: { totalPages },
      data: users.map((user) => ({
        ...user,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString()
      }))
    });
  }
}
