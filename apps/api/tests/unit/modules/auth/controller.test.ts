import AuthController from '@modules/auth/auth.controller';
import { buildMockFastify } from '@tests/unit/helpers/mockFastify';

describe('AuthController', async () => {
  const app = await buildMockFastify();

  describe('getInstance', () => {
    it('should return an instance of AuthController', () => {
      const authController = AuthController.getInstance(app);
      expect(authController).toBeInstanceOf(AuthController);
    });
  });
});
