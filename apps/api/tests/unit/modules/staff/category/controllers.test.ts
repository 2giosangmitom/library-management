import StaffCategoryController from '@/modules/staff/category/controllers';
import { buildMockFastify } from '../../../helpers/mockFastify';

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
