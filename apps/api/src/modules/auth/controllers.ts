import AuthService from './services';
import { RefreshTokenSchema, SignInSchema, SignOutSchema, SignUpSchema } from './schemas';
import { refreshTokenExpiration } from '@src/constants';
import { nanoid } from 'nanoid';

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
      typ: 'access_token',
      sub: validateResult.user.user_id,
      role: validateResult.user.role,
      jti: validateResult.accessTokenJwtId
    } satisfies AccessToken);

    const refreshToken = await reply.jwtSign(
      {
        typ: 'refresh_token',
        sub: validateResult.user.user_id,
        jti: validateResult.refreshTokenJwtId
      } satisfies RefreshToken,
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

  public async refreshToken(
    req: FastifyRequestTypeBox<typeof RefreshTokenSchema>,
    reply: FastifyReplyTypeBox<typeof RefreshTokenSchema>
  ) {
    try {
      const data = await req.jwtVerify<RefreshToken>({ onlyCookie: true });

      const newAccessTokenJwtId = nanoid();
      const { role } = await this.fastify.prisma.user.findUniqueOrThrow({
        where: { user_id: data.sub },
        select: { role: true }
      });

      await this.authService.storeAccessToken(data.sub, newAccessTokenJwtId, data.jti);
      const newAccessToken = await reply.jwtSign({
        typ: 'access_token',
        sub: data.sub,
        jti: newAccessTokenJwtId,
        role
      } satisfies AccessToken);

      return reply.status(200).send({
        message: 'Access token refreshed successfully',
        data: {
          access_token: newAccessToken
        }
      });
    } catch (error) {
      throw req.server.httpErrors.unauthorized(error instanceof Error ? error.message : 'Invalid refresh token');
    }
  }

  public async signOut(
    req: FastifyRequestTypeBox<typeof SignOutSchema>,
    reply: FastifyReplyTypeBox<typeof SignOutSchema>
  ) {
    try {
      const data = await req.jwtVerify<RefreshToken>({ onlyCookie: true });

      await this.authService.revokeUserRefreshToken(data.sub, data.jti);

      return reply
        .clearCookie('refreshToken', {
          httpOnly: true,
          path: '/',
          maxAge: refreshTokenExpiration,
          sameSite: 'none',
          secure: true,
          signed: true
        })
        .status(200)
        .send({
          message: 'User signed out successfully'
        });
    } catch (error) {
      throw req.server.httpErrors.unauthorized(error instanceof Error ? error.message : 'Invalid refresh token');
    }
  }
}
