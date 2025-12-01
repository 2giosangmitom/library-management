import AuthController from './controllers';
import { RefreshTokenSchema, SignInSchema, SignOutSchema, SignUpSchema } from './schemas';

export default function authRoutes(fastify: FastifyTypeBox) {
  const authController = AuthController.getInstance(fastify);

  fastify.post('/signup', { schema: SignUpSchema }, authController.signUp.bind(authController));
  fastify.post('/signin', { schema: SignInSchema }, authController.signIn.bind(authController));
  fastify.post('/refresh-token', { schema: RefreshTokenSchema }, authController.refreshToken.bind(authController));
  fastify.post('/signout', { schema: SignOutSchema }, authController.signOut.bind(authController));
}
