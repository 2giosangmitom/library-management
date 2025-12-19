import UserService from '@/modules/user/services';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';
import { buildMockFastify } from '../../helpers/mockFastify';
import { HttpError } from '@fastify/sensible';

describe('UserService', async () => {
  const app = await buildMockFastify();
  const userService = new UserService({ prisma: app.prisma });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should throw not found error if user does not exist', async () => {
      const userId = faker.string.uuid();

      // Mock no user found
      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(userService.getUserById(userId)).rejects.toThrow(HttpError);
      expect(app.httpErrors.notFound).toHaveBeenCalledWith('User not found');
    });

    it('should return user data when user exists', async () => {
      const userId = faker.string.uuid();
      const mockUser = {
        user_id: userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: Role.MEMBER,
        password_hash: 'hashed_password',
        salt: 'salt_value',
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      // Mock user found
      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);

      const result = await userService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(app.prisma.user.findUnique).toHaveBeenCalledExactlyOnceWith({
        where: { user_id: userId },
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      });
    });

    it('should exclude sensitive fields like password_hash and salt', async () => {
      const userId = faker.string.uuid();
      const mockUser = {
        user_id: userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: Role.MEMBER,
        password_hash: 'hashed_password',
        salt: 'salt_value',
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      vi.spyOn(app.prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);

      await userService.getUserById(userId);

      // Verify that the select option excludes sensitive fields
      expect(app.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
        select: expect.not.objectContaining({
          password_hash: expect.anything(),
          salt: expect.anything()
        })
      });
    });
  });
});
