import AuthService from './auth.service';
import { SignUpSchema } from './auth.schema';

export default class AuthController {
  private static instance: AuthController;
  private authService: AuthService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, authService: AuthService) {
    this.fastify = fastify;
    this.authService = authService;
  }

  public static getInstance(fastify: FastifyTypeBox, authService = AuthService.getInstance(fastify)): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController(fastify, authService);
    }
    return AuthController.instance;
  }

  public async signUp(
    req: FastifyRequestTypeBox<typeof SignUpSchema>,
    reply: FastifyReplyTypeBox<typeof SignUpSchema>
  ) {
    const { email, password, fullName } = req.body;

    const user = await this.authService.createUserAccount({ email, password, fullName, role: 'MEMBER' });

    return reply.status(201).send({
      message: 'User account created successfully',
      data: {
        ...user,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString()
      }
    });
  }
}
