import AuthService from './auth.service';
import { SignInSchema, SignUpSchema } from './auth.schema';
import { refreshTokenExpiration } from '@src/constants';

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

  public async signIn(
    req: FastifyRequestTypeBox<typeof SignInSchema>,
    reply: FastifyReplyTypeBox<typeof SignInSchema>
  ) {
    const validateResult = await this.authService.validateUserCredentials(req.body);

    const accessToken = await reply.jwtSign({
      sub: validateResult.user.user_id,
      role: validateResult.user.role,
      jti: validateResult.accessTokenJwtId
    });

    const refreshToken = await reply.jwtSign(
      {
        sub: validateResult.user.user_id,
        jti: validateResult.refreshTokenJwtId
      },
      {
        expiresIn: refreshTokenExpiration
      }
    );

    return reply
      .setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: refreshTokenExpiration,
        sameSite: 'none',
        secure: true,
        signed: true
      })
      .status(200)
      .send({
        message: 'User signed in successfully',
        data: {
          access_token: accessToken
        }
      });
  }
}
