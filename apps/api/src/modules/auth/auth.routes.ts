import { authMiddleware } from '@src/middlewares/auth';
import { AuthController } from './auth.controller';
import { signUpSchema, signInSchema, signOutSchema } from './auth.schema';

export default function authRoutes(fastify: FastifyTypeBox) {
  const authController = AuthController.getInstance(fastify);

  fastify.post('/signup', { schema: signUpSchema }, authController.signUp.bind(authController));
  fastify.post('/signin', { schema: signInSchema }, authController.signIn.bind(authController));
  fastify.post(
    '/signout',
    { schema: signOutSchema, onRequest: authMiddleware },
    authController.signOut.bind(authController)
  );
}
