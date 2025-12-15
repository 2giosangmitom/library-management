import StaffUserService from '@/modules/staff/user/services';
import { buildMockFastify } from '../../../helpers/mockFastify';
import { faker } from '@faker-js/faker';
import { Role } from '@/generated/prisma/enums';

const buildQuery = () => ({
  page: 1,
  limit: 10,
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: Role.MEMBER
});

describe('StaffUserService', async () => {
  const app = await buildMockFastify();
  const service = StaffUserService.getInstance(app);

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should call prisma.user.findMany with filters and pagination', async () => {
      const query = buildQuery();

      await service.getUsers(query);

      expect(app.prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            email: expect.objectContaining({ contains: query.email, mode: 'insensitive' }),
            name: expect.objectContaining({ contains: query.name, mode: 'insensitive' }),
            role: query.role
          }),
          skip: (query.page - 1) * query.limit,
          take: query.limit
        })
      );

      expect(app.prisma.user.count).toHaveBeenCalledWith({ where: expect.any(Object) });
      expect(app.prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should return users and total', async () => {
      const query = buildQuery();
      const users = [
        {
          user_id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: Role.ADMIN,
          created_at: faker.date.anytime(),
          updated_at: faker.date.anytime()
        }
      ];
      const total = 1;

      vi.mocked(app.prisma.$transaction).mockResolvedValueOnce([users, total]);

      const result = await service.getUsers(query);

      expect(result).toEqual({ users, total });
    });
  });
});
