import AuthorController from '@modules/author/author.controller';
import { buildMockFastify } from '@tests/unit/helpers/mockFastify';

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
