import AuthController from '@/modules/auth/controllers.js';
import { buildMockFastify } from '../../helpers/mockFastify.js';

describe('AuthController', async () => {
  const app = await buildMockFastify();

  describe('getInstance', () => {
    it('should return an instance of AuthController', () => {
      const authController = AuthController.getInstance(app);
      expect(authController).toBeInstanceOf(AuthController);
    });
  });
});
