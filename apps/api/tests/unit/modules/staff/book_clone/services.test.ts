import StaffBookCloneService from '@modules/staff/book_clone/services';
import { buildMockFastify } from '@tests/unit/helpers/mockFastify';
import { faker } from '@faker-js/faker';
import { BookCondition, Prisma } from '@src/generated/prisma/client';

describe('StaffBookCloneService', async () => {
  const app = await buildMockFastify();
  const service = StaffBookCloneService.getInstance(app);

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('createBookClone', () => {
    it('should call prisma.book_Clone.create with correct data', async () => {
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.NEW
      };

      const mockCreatedBookClone = {
        book_clone_id: faker.string.uuid(),
        ...data,
        is_available: true,
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      vi.mocked(app.prisma.book_Clone.create).mockResolvedValueOnce(
        mockCreatedBookClone as unknown as Awaited<ReturnType<typeof app.prisma.book_Clone.create>>
      );

      const result = await service.createBookClone(data);

      expect(app.prisma.book_Clone.create).toHaveBeenCalledWith({
        data: {
          book_id: data.book_id,
          location_id: data.location_id,
          barcode: data.barcode,
          condition: data.condition
        }
      });

      expect(result).toEqual(mockCreatedBookClone);
    });

    it('should throw conflict error if barcode already exists', async () => {
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.NEW
      };

      vi.mocked(app.prisma.book_Clone.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.createBookClone(data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ConflictError: Book clone with the given barcode already exists.]`
      );
    });

    it('should throw bad request error for foreign key constraint violation', async () => {
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.GOOD
      };

      vi.mocked(app.prisma.book_Clone.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
          code: 'P2003',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.createBookClone(data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[BadRequestError: Invalid book_id or location_id provided.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.WORN
      };

      vi.mocked(app.prisma.book_Clone.create).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.createBookClone(data)).rejects.toThrowError('Some other error');
    });

    it('should return created book clone on success', async () => {
      const data = {
        book_id: faker.string.uuid(),
        location_id: faker.string.alphanumeric(10),
        barcode: faker.string.alphanumeric(10),
        condition: BookCondition.DAMAGED
      };

      const mockCreatedBookClone = {
        book_clone_id: faker.string.uuid(),
        ...data,
        is_available: true,
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      };

      vi.mocked(app.prisma.book_Clone.create).mockResolvedValueOnce(
        mockCreatedBookClone as unknown as Awaited<ReturnType<typeof app.prisma.book_Clone.create>>
      );

      const result = await service.createBookClone(data);

      expect(result).toEqual(
        expect.objectContaining({
          book_clone_id: expect.any(String),
          book_id: data.book_id,
          location_id: data.location_id,
          barcode: data.barcode,
          condition: data.condition,
          is_available: true,
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        })
      );
    });

    it('should handle all condition types', async () => {
      for (const condition of Object.values(BookCondition)) {
        const data = {
          book_id: faker.string.uuid(),
          location_id: faker.string.alphanumeric(10),
          barcode: faker.string.alphanumeric(10),
          condition
        };

        const mockCreatedBookClone = {
          book_clone_id: faker.string.uuid(),
          ...data,
          is_available: true,
          created_at: faker.date.anytime(),
          updated_at: faker.date.anytime()
        };

        vi.mocked(app.prisma.book_Clone.create).mockResolvedValueOnce(
          mockCreatedBookClone as unknown as Awaited<ReturnType<typeof app.prisma.book_Clone.create>>
        );

        const result = await service.createBookClone(data);

        expect(result.condition).toBe(condition);
        vi.clearAllMocks();
      }
    });
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = StaffBookCloneService.getInstance(app);
      const instance2 = StaffBookCloneService.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });
});
