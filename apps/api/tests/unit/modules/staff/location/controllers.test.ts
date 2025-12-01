import StaffLocationController from '@/modules/staff/location/controllers';
import { buildMockFastify } from '../../../helpers/mockFastify';

describe('StaffLocationController', async () => {
  const app = await buildMockFastify();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = StaffLocationController.getInstance(app);
      const instance2 = StaffLocationController.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });
});
