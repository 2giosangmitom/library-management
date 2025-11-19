import { UserRepository } from '@modules/user/user.repository';
import fastify from 'fastify';
import { faker } from '@faker-js/faker';
import { PrismaClient, Role, Prisma } from '@prisma/client';

describe('UserRepository', async () => {
  const app = fastify();
  const userRepository = UserRepository.getInstance(app);

  beforeAll(() => {
    app.decorate('prisma', {
      $transaction: vi.fn(),
      user: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn()
      }
    } as unknown as PrismaClient);
  });

  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(app.prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data
        })
      );
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

      await expect(userRepository.createUser(data)).rejects.toThrowError(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findUserByEmail', () => {
    it("should call prisma's findUnique method with correct parameters", async () => {
      const email = faker.internet.email();

      await userRepository.findUserByEmail(email);

      expect(app.prisma.user.findUnique).toHaveBeenCalledOnce();
      expect(app.prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            email
          }
        })
      );
    });

    it('should return the found user', async () => {
      const email = faker.internet.email();

      const mockUser = {
        user_id: faker.string.uuid(),
        password_hash: faker.internet.password(),
        salt: faker.string.alpha(16),
        name: faker.person.fullName(),
        email,
        role: Role.MEMBER
      } as Awaited<ReturnType<typeof app.prisma.user.findUnique>>;

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(mockUser);

      const result = await userRepository.findUserByEmail(email);

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if prisma findUnique fails', async () => {
      const email = faker.internet.email();

      const mockError = new Prisma.PrismaClientKnownRequestError('Prisma findUnique failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.user.findUnique).mockRejectedValueOnce(mockError);

      await expect(userRepository.findUserByEmail(email)).rejects.toThrowError(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findUserById', () => {
    it("should call prisma's findUnique method with correct parameters", async () => {
      const user_id = faker.string.uuid();

      await userRepository.findUserById(user_id);

      expect(app.prisma.user.findUnique).toHaveBeenCalledOnce();
      expect(app.prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user_id
          }
        })
      );
    });

    it('should return the found user', async () => {
      const user_id = faker.string.uuid();

      const mockUser = {
        user_id,
        password_hash: faker.internet.password(),
        salt: faker.string.alpha(16),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: Role.MEMBER
      } as Awaited<ReturnType<typeof app.prisma.user.findUnique>>;

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(mockUser);

      const result = await userRepository.findUserById(user_id);

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if prisma findUnique fails', async () => {
      const user_id = faker.string.uuid();

      const mockError = new Prisma.PrismaClientKnownRequestError('Prisma findUnique failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.user.findUnique).mockRejectedValueOnce(mockError);

      await expect(userRepository.findUserById(user_id)).rejects.toThrowError(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('updateUser', () => {
    it("should call prisma's update method with correct parameters", async () => {
      const user_id = faker.string.uuid();
      const data = {
        name: faker.person.fullName(),
        role: Role.ADMIN,
        email: faker.internet.email()
      };

      await userRepository.updateUser(user_id, data);

      expect(app.prisma.user.update).toHaveBeenCalledOnce();
      expect(app.prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user_id
          },
          data
        })
      );
    });

    it('should return the updated user', async () => {
      const user_id = faker.string.uuid();
      const data = {
        name: faker.person.fullName(),
        role: Role.ADMIN,
        email: faker.internet.email()
      };

      const mockUser = {
        user_id,
        password_hash: faker.internet.password(),
        salt: faker.string.alpha(16),
        ...data
      } as Awaited<ReturnType<typeof app.prisma.user.update>>;

      vi.mocked(app.prisma.user.update).mockResolvedValueOnce(mockUser);

      const result = await userRepository.updateUser(user_id, data);

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if prisma update fails', async () => {
      const user_id = faker.string.uuid();
      const data = {
        name: faker.person.fullName(),
        role: Role.ADMIN,
        email: faker.internet.email()
      };

      const mockError = new Prisma.PrismaClientKnownRequestError('Prisma update failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.user.update).mockRejectedValueOnce(mockError);

      await expect(userRepository.updateUser(user_id, data)).rejects.toThrowError(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('getUserCredentialsByEmail', () => {
    it("should call prisma's findUnique method with correct parameters", async () => {
      const email = faker.internet.email();

      await userRepository.getUserCredentialsByEmail(email);

      expect(app.prisma.user.findUnique).toHaveBeenCalledOnce();
      expect(app.prisma.user.findUnique).toHaveBeenCalledWith({
        select: {
          password_hash: true,
          salt: true
        },
        where: {
          email
        }
      });
    });

    it('should return the user credentials', async () => {
      const email = faker.internet.email();

      const mockCredentials = {
        password_hash: faker.internet.password(),
        salt: faker.string.alpha(16)
      } as Awaited<ReturnType<typeof app.prisma.user.findUnique>>;

      vi.mocked(app.prisma.user.findUnique).mockResolvedValueOnce(mockCredentials);

      const result = await userRepository.getUserCredentialsByEmail(email);

      expect(result).toEqual(mockCredentials);
    });

    it('should throw an error if prisma findUnique fails', async () => {
      const email = faker.internet.email();

      const mockError = new Prisma.PrismaClientKnownRequestError('Prisma findUnique failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.user.findUnique).mockRejectedValueOnce(mockError);

      await expect(userRepository.getUserCredentialsByEmail(email)).rejects.toThrowError(
        Prisma.PrismaClientKnownRequestError
      );
    });
  });

  describe('findAllUsers', () => {
    it("should call prisma's findMany method", async () => {
      const page = 3;
      const pageSize = 5;

      await userRepository.findAllUsers(page, pageSize);

      expect(app.prisma.user.findMany).toHaveBeenCalledOnce();
      expect(app.prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 5
        })
      );
    });

    it("should call prisma's count method", async () => {
      const page = 2;
      const pageSize = 5;

      await userRepository.findAllUsers(page, pageSize);

      expect(app.prisma.user.count).toHaveBeenCalledOnce();
    });

    it("should call prisma's $transaction method", async () => {
      const page = 2;
      const pageSize = 5;

      await userRepository.findAllUsers(page, pageSize);

      expect(app.prisma.$transaction).toHaveBeenCalledOnce();
    });

    it('should return a list of users and total count', async () => {
      const page = 1;
      const pageSize = 3;

      const mockUsers = Array.from({ length: pageSize }).map(() => ({
        user_id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: Role.MEMBER,
        created_at: new Date(),
        updated_at: new Date()
      })) as Awaited<ReturnType<typeof app.prisma.user.findMany>>;

      vi.mocked(app.prisma.$transaction).mockResolvedValueOnce([10, mockUsers]);

      const result = await userRepository.findAllUsers(page, pageSize);

      expect(result).toEqual([10, mockUsers]);
    });

    it('should throw an error if prisma $transaction fails', async () => {
      const page = 1;
      const pageSize = 3;

      const mockError = new Prisma.PrismaClientKnownRequestError('Prisma $transaction failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.$transaction).mockRejectedValueOnce(mockError);

      await expect(userRepository.findAllUsers(page, pageSize)).rejects.toThrowError(
        Prisma.PrismaClientKnownRequestError
      );
    });
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple getInstance calls', () => {
      const instance1 = UserRepository.getInstance(app);
      const instance2 = UserRepository.getInstance(app);

      expect(instance1).toBe(instance2);
    });
  });
});
