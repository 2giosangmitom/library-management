import { generateHash } from '@utils/hash';
import { AuthModel } from './auth.model';

export class AuthService {
  private static instance: AuthService | null = null;
  private authModel: AuthModel;

  private constructor(authModel: AuthModel) {
    this.authModel = authModel;
  }

  public static getInstance(fastify: FastifyTypeBox, authModel = AuthModel.getInstance(fastify)) {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(authModel);
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
