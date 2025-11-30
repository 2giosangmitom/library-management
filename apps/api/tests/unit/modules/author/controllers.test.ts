import AuthorController from '@/modules/author/controllers.js';
import { buildMockFastify } from '../../helpers/mockFastify.js';

describe('AuthorController', async () => {
  const app = await buildMockFastify();

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', async () => {
      const instance1 = AuthorController.getInstance(app);
      const instance2 = AuthorController.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });
});
