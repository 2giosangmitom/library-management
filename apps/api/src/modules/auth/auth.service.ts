export class AuthService {
  private fastify: FastifyTypeBox;
  private static instance: AuthService;
  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox) {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(fastify);
    }
    return AuthService.instance;
  }

  public async signUp({ email, password, name }: { email: string; password: string; name: string }) {}
}
