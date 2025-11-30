import { Role } from '@/generated/prisma/enums.js';
import { generateHash, verifyHash } from '@/utils/hash.js';
import { JWTUtils } from '@/utils/jwt.js';
import { nanoid } from 'nanoid';

export default class AuthService {
  private static instance: AuthService;
  private fastify: FastifyTypeBox;
  private jwtUtils: JWTUtils;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
    this.jwtUtils = JWTUtils.getInstance(fastify.redis);
  }

  public static getInstance(fastify: FastifyTypeBox): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(fastify);
    }
    return AuthService.instance;
  }

  public async createUserAccount(data: { email: string; password: string; fullName: string; role: Role }) {
    const { email, password, fullName, role } = data;

    // Check if email already exists
    const existingUser = await this.fastify.prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      throw this.fastify.httpErrors.conflict('Email is already in use');
    }

    const { hash, salt } = await generateHash(password);

    const user = await this.fastify.prisma.user.create({
      omit: { password_hash: true, salt: true },
      data: {
        email,
        password_hash: hash,
        salt,
        role,
        name: fullName
      }
    });

    return user;
  }

  public async validateUserCredentials(data: { email: string; password: string }) {
    const { email, password } = data;

    // Validate email
    const user = await this.fastify.prisma.user.findUnique({
      where: { email }
    });
    const invalidCredentialsError = this.fastify.httpErrors.unauthorized('Invalid credentials');

    if (!user) {
      throw invalidCredentialsError;
    }

    // Validate password
    const isPasswordValid = await verifyHash(password, user.password_hash, user.salt);

    if (!isPasswordValid) {
      throw invalidCredentialsError;
    }

    const refreshTokenJwtId = nanoid();
    const accessTokenJwtId = nanoid();

    const promises = [
      this.jwtUtils.storeRefreshToken(user.user_id, refreshTokenJwtId),
      this.jwtUtils.storeAccessToken(user.user_id, accessTokenJwtId, refreshTokenJwtId)
    ];
    await Promise.all(promises);

    return { user, refreshTokenJwtId, accessTokenJwtId };
  }

  public async storeAccessToken(userId: string, accessTokenId: string, refreshTokenId: string) {
    await this.jwtUtils.storeAccessToken(userId, accessTokenId, refreshTokenId);
  }

  public async revokeUserRefreshToken(userId: string, refreshTokenId: string) {
    await this.jwtUtils.revokeRefreshToken(userId, refreshTokenId);
  }
}
