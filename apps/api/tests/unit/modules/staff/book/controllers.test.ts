import StaffBookController from '@modules/staff/book/controllers';
import { buildMockFastify } from '@tests/unit/helpers/mockFastify';

describe('StaffBookController', async () => {
  const app = await buildMockFastify();

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = StaffBookController.getInstance(app);
      const instance2 = StaffBookController.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });
});
