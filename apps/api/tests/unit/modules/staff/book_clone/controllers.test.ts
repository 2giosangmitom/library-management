import StaffBookCloneController from '@/modules/staff/book_clone/controllers';
import { buildMockFastify } from '../../../helpers/mockFastify';

describe('StaffBookCloneController', async () => {
  const app = await buildMockFastify();

  afterAll(async () => {
    await app.close();
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = StaffBookCloneController.getInstance(app);
      const instance2 = StaffBookCloneController.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });
});
