import StaffPublisherController from '@modules/staff/publisher/controllers';
import { buildMockFastify } from '@tests/unit/helpers/mockFastify';

describe('StaffPublisherController', async () => {
  const app = await buildMockFastify();

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = StaffPublisherController.getInstance(app);
      const instance2 = StaffPublisherController.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });
});
