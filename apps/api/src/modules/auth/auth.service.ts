import { generateHash, verifyHash } from '@utils/hash';
import { UserModel } from '@modules/user/user.model';

export class AuthService {
  private static instance: AuthService | null = null;
  private userModel: UserModel;

  private constructor(userModel: UserModel) {
    this.userModel = userModel;
  }

  public static getInstance(fastify: FastifyTypeBox, userModel = UserModel.getInstance(fastify)) {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(userModel);
    }
    return AuthService.instance;
  }

  /**
   * Sign up a new user
   * @param data User data for signing up
   * @returns The created user
   */
  public async signUp(data: { email: string; password: string; name: string }) {
    const { hash, salt } = await generateHash(data.password);

    return this.userModel.createUser({
      email: data.email,
      password_hash: hash,
      salt,
      name: data.name
    });
  }

  /**
   * Sign in with email and password
   * @param data The email and password for signing in
   * @returns True and the user ID if the credentials are correct, otherwise false and null
   */
  public async signIn(data: { email: string; password: string }) {
    const user = await this.userModel.findUserByEmail(data.email);

    // Fails if email not exists
    if (!user) {
      return { verifyResult: false, user_id: null, role: null };
    }

    const verifyResult = await verifyHash(data.password, user.password_hash, user.salt);

    return { verifyResult, user_id: verifyResult ? user.user_id : null, role: verifyResult ? user.role : null };
  }
}
