import StaffCategoryController from '@/modules/staff/category/controllers.js';
import { buildMockFastify } from '../../../helpers/mockFastify.js';

describe('StaffCategoryController', async () => {
  const app = await buildMockFastify();

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const i1 = StaffCategoryController.getInstance(app);
      const i2 = StaffCategoryController.getInstance(app);
      expect(i1).toBe(i2);
    });
  });
});
