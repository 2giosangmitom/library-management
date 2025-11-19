import { BookCloneRepository } from '@modules/book_clone/book_clone.repository';
import fastify from 'fastify';
import { PrismaClient, Prisma, BookCondition } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('BookCloneRepository', () => {
  const app = fastify();
  const bookCloneRepository = BookCloneRepository.getInstance(app);

  beforeAll(() => {
    app.decorate('prisma', {
      $transaction: vi.fn(),
      book_Clone: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        delete: vi.fn()
      }
    } as unknown as PrismaClient);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBookClone', () => {
    it('should call prisma.book_Clone.create with correct data', async () => {
      const mockData = {
        book_id: faker.string.uuid(),
        location_id: faker.string.uuid(),
        is_available: true,
        barcode: faker.string.uuid(),
        condition: BookCondition.GOOD
      };

      await bookCloneRepository.createBookClone(mockData);

      expect(app.prisma.book_Clone.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockData
        })
      );
    });

    it('should return the created book clone', async () => {
      const mockData = {
        book_id: faker.string.uuid(),
        location_id: faker.string.uuid(),
        is_available: true,
        barcode: faker.string.uuid(),
        condition: BookCondition.GOOD
      };

      const mockCreatedClone = {
        book_clone_id: faker.string.uuid(),
        ...mockData,
        created_at: new Date(),
        updated_at: new Date()
      };

      vi.mocked(app.prisma.book_Clone.create).mockResolvedValueOnce(mockCreatedClone);

      await expect(bookCloneRepository.createBookClone(mockData)).resolves.toEqual(mockCreatedClone);
    });

    it('should throw an error if prisma.book_Clone.create fails', async () => {
      const mockData = {
        book_id: faker.string.uuid(),
        location_id: faker.string.uuid(),
        is_available: true,
        barcode: faker.string.uuid(),
        condition: BookCondition.GOOD
      };

      const mockError = new Prisma.PrismaClientKnownRequestError('Database error', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      });
      vi.mocked(app.prisma.book_Clone.create).mockRejectedValueOnce(mockError);

      await expect(bookCloneRepository.createBookClone(mockData)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('deleteBookClone', () => {
    it('should call prisma.book_Clone.delete with correct book_clone_id', async () => {
      const mockBookCloneId = faker.string.uuid();

      await bookCloneRepository.deleteBookClone(mockBookCloneId);

      expect(app.prisma.book_Clone.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_clone_id: mockBookCloneId },
          select: { book_clone_id: true }
        })
      );
    });

    it('should return the deleted book clone', async () => {
      const mockBookCloneId = faker.string.uuid();
      const mockDeletedClone = { book_clone_id: mockBookCloneId } as unknown as Awaited<
        ReturnType<typeof app.prisma.book_Clone.delete>
      >;

      vi.mocked(app.prisma.book_Clone.delete).mockResolvedValueOnce(mockDeletedClone);

      await expect(bookCloneRepository.deleteBookClone(mockBookCloneId)).resolves.toEqual(mockDeletedClone);
    });

    it('should throw an error if prisma.book_Clone.delete fails', async () => {
      const mockBookCloneId = faker.string.uuid();

      const mockError = new Prisma.PrismaClientKnownRequestError('Database error', {
        code: 'P2025',
        clientVersion: Prisma.prismaVersion.client
      });
      vi.mocked(app.prisma.book_Clone.delete).mockRejectedValueOnce(mockError);

      await expect(bookCloneRepository.deleteBookClone(mockBookCloneId)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError
      );
    });
  });

  describe('updateBookClone', () => {
    it('should call prisma.book_Clone.update with correct parameters', async () => {
      const mockBookCloneId = faker.string.uuid();
      const mockUpdateData = {
        is_available: false,
        condition: BookCondition.DAMAGED
      };

      await bookCloneRepository.updateBookClone(mockBookCloneId, mockUpdateData);

      expect(app.prisma.book_Clone.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_clone_id: mockBookCloneId },
          data: mockUpdateData
        })
      );
    });

    it('should return the updated book clone', async () => {
      const mockBookCloneId = faker.string.uuid();
      const mockUpdateData = {
        is_available: false,
        condition: BookCondition.DAMAGED
      };

      const mockUpdatedClone = {
        book_clone_id: mockBookCloneId,
        book_id: faker.string.uuid(),
        location_id: faker.string.uuid(),
        is_available: mockUpdateData.is_available,
        barcode: faker.string.uuid(),
        condition: mockUpdateData.condition,
        created_at: new Date(),
        updated_at: new Date()
      };

      vi.mocked(app.prisma.book_Clone.update).mockResolvedValueOnce(mockUpdatedClone);

      await expect(bookCloneRepository.updateBookClone(mockBookCloneId, mockUpdateData)).resolves.toEqual(
        mockUpdatedClone
      );
    });

    it('should throw an error if prisma.book_Clone.update fails', async () => {
      const mockBookCloneId = faker.string.uuid();
      const mockUpdateData = {
        is_available: false,
        condition: BookCondition.DAMAGED
      };

      const mockError = new Prisma.PrismaClientKnownRequestError('Database error', {
        code: 'P2025',
        clientVersion: Prisma.prismaVersion.client
      });
      vi.mocked(app.prisma.book_Clone.update).mockRejectedValueOnce(mockError);

      await expect(bookCloneRepository.updateBookClone(mockBookCloneId, mockUpdateData)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError
      );
    });
  });

  describe('findAllBookClones', () => {
    it('should call prisma.book_Clone.findMany with correct parameters', async () => {
      const page = 4;
      const pageSize = 10;

      await bookCloneRepository.findAllBookClones(page, pageSize);

      expect(app.prisma.book_Clone.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 30,
          take: 10
        })
      );
    });

    it("should call prisma.book_Clone.count to get total count", async () => {
      const page = 2;
      const pageSize = 5;

      await bookCloneRepository.findAllBookClones(page, pageSize);

      expect(app.prisma.book_Clone.count).toHaveBeenCalled();
    });

    it('should return total count and array of book clones', async () => {
      const page = 1;
      const pageSize = 10;

      const mockCount = 42;
      const mockBookClones = Array.from({ length: 10 }).map(() => ({
        book_clone_id: faker.string.uuid(),
        book_id: faker.string.uuid(),
        location_id: faker.string.uuid(),
        is_available: true,
        barcode: faker.string.uuid(),
        condition: BookCondition.GOOD,
        created_at: new Date(),
        updated_at: new Date()
      }));

      vi.mocked(app.prisma.$transaction).mockResolvedValueOnce([mockCount, mockBookClones]);

      await expect(bookCloneRepository.findAllBookClones(page, pageSize)).resolves.toEqual([
        mockCount,
        mockBookClones
      ]);
    });

    it('should throw an error if prisma.book_Clone.findMany fails', async () => {
      const page = 1;
      const pageSize = 10;

      const mockError = new Prisma.PrismaClientKnownRequestError('Database error', {
        code: 'P2025',
        clientVersion: Prisma.prismaVersion.client
      });
      vi.mocked(app.prisma.$transaction).mockRejectedValueOnce(mockError);

      await expect(bookCloneRepository.findAllBookClones(page, pageSize)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError
      );
    });
  });
});
