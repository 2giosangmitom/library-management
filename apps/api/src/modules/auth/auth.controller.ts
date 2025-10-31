import { Prisma } from '@prisma/client';
import { signInSchema, signOutSchema, signUpSchema } from './auth.schema';
import { AuthService } from './auth.service';
import { RedisTokenUtils } from '@utils/redis';
import { nanoid } from 'nanoid';

export class AuthController {
  private static instance: AuthController | null = null;
  private authService: AuthService;
  private redisTokenUtils: RedisTokenUtils;

  private constructor(fastify: FastifyTypeBox, authService: AuthService) {
    this.authService = authService;
    this.redisTokenUtils = RedisTokenUtils.getInstance(fastify.redis);
  }

  public static getInstance(fastify: FastifyTypeBox, authService = AuthService.getInstance(fastify)) {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController(fastify, authService);
    }
    return AuthController.instance;
  }

  /**
   * Route handler for signing up a new user
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return reply.status(409).send({ message: 'Email already exists' });
        }
      }
      throw error;
    }
  }

  /**
   * Route handler for signing in a user
   */
  public async signIn(
    req: FastifyRequestTypeBox<typeof signInSchema>,
    reply: FastifyReplyTypeBox<typeof signInSchema>
  ) {
    const { email, password } = req.body;

    const { verifyResult, user_id, role } = await this.authService.signIn({ email, password });
    if (!verifyResult || !user_id || !role) {
      return reply.status(401).send({ message: 'Invalid email or password' });
    }

    const jti = nanoid();
    const jwt = await reply.jwtSign({
      sub: user_id,
      role,
      jti
    });
    await this.redisTokenUtils.setToken('jwt', jti, user_id, 30 * 24 * 60 * 60); // 30 days expiration

    return reply.send({ jwt });
  }

  /**
   * Route handler for signing out a user
   */
  public async signOut(
    req: FastifyRequestTypeBox<typeof signOutSchema>,
    reply: FastifyReplyTypeBox<typeof signOutSchema>
  ) {
    const jwtData = req.user as JWTPayload;

    await this.redisTokenUtils.deleteToken('jwt', jwtData.jti);

    return reply.status(204).send();
  }
}
