import { generateHash } from '@utils/hash';
import { AuthModel } from './auth.model';

export class AuthService {
  private fastify: FastifyTypeBox;
  private static instance: AuthService | null = null;
  private authModel: AuthModel;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
    this.authModel = AuthModel.getInstance(this.fastify);
  }

  public static getInstance(fastify: FastifyTypeBox) {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(fastify);
    }
    return AuthService.instance;
  }

  /**
   * Sign up a new user
   * @param param0 User data for signing up
   * @returns The created user
   */
  public async signUp({ email, password, name }: { email: string; password: string; name: string }) {
    const { hash, salt } = await generateHash(password);

    return this.authModel.createUser({
      email,
      password_hash: hash,
      salt,
      name
    });
  }
}
