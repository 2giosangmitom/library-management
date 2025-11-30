import StaffAuthorController from '@/modules/staff/author/controllers.js';
import { buildMockFastify } from '../../../helpers/mockFastify.js';

describe('StaffAuthorController', async () => {
  const app = await buildMockFastify();

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = StaffAuthorController.getInstance(app);
      const instance2 = StaffAuthorController.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });
});
