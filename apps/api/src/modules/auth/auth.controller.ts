import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { signUpSchema } from './auth.schema';
import { AuthService } from './auth.service';

export class AuthController {
  private static instance: AuthController | null = null;
  private authService: AuthService;

  private constructor(authService: AuthService) {
    this.authService = authService;
  }

  public static getInstance(fastify: FastifyTypeBox, authService = AuthService.getInstance(fastify)) {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController(authService);
    }
    return AuthController.instance;
  }

  /**
   * Route handler for signing up a new user
   * @param req Fastify request object
   * @param reply Fastify reply object
   */
  public async signUp(
    req: FastifyRequestTypeBox<typeof signUpSchema>,
    reply: FastifyReplyTypeBox<typeof signUpSchema>
  ) {
    const { email, password, name } = req.body;

    try {
      const newUser = await this.authService.signUp({ email, password, name });
      return reply.status(201).send({
        ...newUser,
        created_at: newUser.created_at.toISOString()
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return reply.status(409).send({ message: 'Email already exists' });
        }
      }
      throw error;
    }
  }
}
