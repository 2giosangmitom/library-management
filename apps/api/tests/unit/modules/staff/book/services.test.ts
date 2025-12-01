import StaffBookService from '@/modules/staff/book/services';
import { buildMockFastify } from '../../../helpers/mockFastify';
import { faker } from '@faker-js/faker';
import { Prisma } from '@/generated/prisma/client';

describe('StaffBookService', async () => {
  const app = await buildMockFastify();
  const service = StaffBookService.getInstance(app);

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('createBook', () => {
    it('should call prisma.book.create with correct data', async () => {
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null,
        authors: undefined,
        categories: undefined
      };

      await service.createBook(data);

      expect(app.prisma.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: data.title,
            description: data.description,
            isbn: data.isbn
          })
        })
      );
    });

    it('should throw conflict error if isbn already exists', async () => {
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      };

      vi.mocked(app.prisma.book.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.createBook(data)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ConflictError: Book with the given ISBN already exists.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      };

      vi.mocked(app.prisma.book.create).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.createBook(data)).rejects.toThrowError('Some other error');
    });

    it('should return created book on success', async () => {
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      };

      vi.mocked(app.prisma.book.create).mockResolvedValueOnce({
        ...data,
        book_id: faker.string.uuid(),
        published_at: new Date(data.published_at),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      } as unknown as Awaited<ReturnType<typeof app.prisma.book.create>>);

      const result = await service.createBook(data);

      expect(result).toEqual(
        expect.objectContaining({
          ...data,
          book_id: expect.any(String),
          published_at: expect.any(Date),
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        })
      );
    });
  });

  describe('deleteBook', () => {
    it('should call prisma.book.delete with correct book_id', async () => {
      const id = faker.string.uuid();

      await service.deleteBook(id);

      expect(app.prisma.book.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { book_id: id } }));
    });

    it('should create relations when authors and categories provided', async () => {
      const data = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null,
        authors: [faker.string.uuid(), faker.string.uuid()],
        categories: [faker.string.uuid()]
      };

      vi.mocked(app.prisma.book.create).mockResolvedValueOnce({
        ...data,
        book_id: faker.string.uuid(),
        published_at: new Date(data.published_at),
        authors: data.authors.map((author_id) => ({ author_id })),
        categories: data.categories.map((category_id) => ({ category_id })),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime()
      } as unknown as Awaited<ReturnType<typeof app.prisma.book.create>>);

      const result = await service.createBook(data);

      expect(app.prisma.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            authors: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ author: { connect: { author_id: data.authors[0] } } })
              ])
            }),
            categories: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ category: { connect: { category_id: data.categories[0] } } })
              ])
            })
          })
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          book_id: expect.any(String),
          authors: expect.any(Array),
          categories: expect.any(Array)
        })
      );
    });

    it('should return deleted book', async () => {
      const id = faker.string.uuid();
      const deleted = { book_id: id, title: faker.lorem.sentence() } as unknown as Awaited<
        ReturnType<typeof app.prisma.book.delete>
      >;

      vi.mocked(app.prisma.book.delete).mockResolvedValueOnce(deleted);

      const result = await service.deleteBook(id);

      expect(result).toEqual(deleted);
    });

    it("should throw 404 error if book doesn't exist", async () => {
      const id = faker.string.uuid();

      vi.mocked(app.prisma.book.delete).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(service.deleteBook(id)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Book with the given ID does not exist.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const id = faker.string.uuid();

      vi.mocked(app.prisma.book.delete).mockRejectedValueOnce(new Error('Some other error'));

      await expect(service.deleteBook(id)).rejects.toThrowError('Some other error');
    });
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = StaffBookService.getInstance(app);
      const instance2 = StaffBookService.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });
});
