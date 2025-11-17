import { UserRepository } from '@modules/user/user.repository';
import fastify from 'fastify';
import { faker } from '@faker-js/faker';
import { PrismaClient, Role, Prisma } from '@prisma/client';

describe('UserRepository', async () => {
  const app = fastify();
  app.decorate('prisma', {
    user: {
      create: vi.fn()
    }
  } as unknown as PrismaClient);
  const userRepository = UserRepository.getInstance(app);

  beforeEach(() => {
    vi.mockObject(app.prisma.user, { spy: true });
  });

  describe('createUser', () => {
    it("should call prisma's create method with correct parameters", async () => {
      const data = {
        email: faker.internet.email(),
        password_hash: faker.internet.password(),
        salt: faker.string.alpha(16),
        name: faker.person.fullName()
      };

      await userRepository.createUser(data);

      expect(app.prisma.user.create).toHaveBeenCalledOnce();
      expect(app.prisma.user.create).toHaveBeenCalledWith({
        select: {
          user_id: true,
          email: true,
          name: true,
          role: true,
          created_at: true
        },
        data: { ...data }
      });
    });

    it('should return the created user', async () => {
      const data = {
        email: faker.internet.email(),
        password_hash: faker.internet.password(),
        salt: faker.string.alpha(16),
        name: faker.person.fullName()
      };

      const mockUser = {
        user_id: faker.string.uuid(),
        email: data.email,
        name: data.name,
        role: Role.MEMBER,
        created_at: new Date()
      } as Awaited<ReturnType<typeof app.prisma.user.create>>;

      vi.mocked(app.prisma.user.create).mockResolvedValueOnce(mockUser);

      const result = await userRepository.createUser(data);

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if prisma create fails', async () => {
      const data = {
        email: faker.internet.email(),
        password_hash: faker.internet.password(),
        salt: faker.string.alpha(16),
        name: faker.person.fullName()
      };

      const mockError = new Prisma.PrismaClientKnownRequestError('Prisma create failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.user.create).mockRejectedValueOnce(mockError);

      await expect(userRepository.createUser(data)).rejects.toThrowError(mockError);
    });
  });
});
