import { BookRepository } from '@modules/book/book.repository';
import fastify from 'fastify';
import { Prisma, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('BookRepository', () => {
  const app = fastify();
  const bookRepository = BookRepository.getInstance(app);

  beforeAll(() => {
    app.decorate('prisma', {
      $transaction: vi.fn(),
      book: {
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

  describe('createBook', () => {
    it('should call prisma.book.create with correct parameters', async () => {
      const bookData = {
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        publisher_id: faker.string.uuid(),
        authors: [faker.string.uuid(), faker.string.uuid()]
      };

      const expectedSelect = {
        book_id: true,
        title: true,
        description: true,
        publisher_id: true,
        authors: {
          select: {
            author_id: true
          }
        },
        created_at: true
      };

      const expectedData = {
        title: bookData.title,
        description: bookData.description,
        publisher_id: bookData.publisher_id,
        authors: {
          createMany: {
            data: [{ author_id: bookData.authors[0] }, { author_id: bookData.authors[1] }],
            skipDuplicates: true
          }
        }
      };

      await bookRepository.createBook(bookData);

      expect(app.prisma.book.create).toHaveBeenCalledWith({
        select: expectedSelect,
        data: expectedData
      });
    });

    it('should return the created book', async () => {
      const bookData = {
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        publisher_id: faker.string.uuid(),
        authors: [faker.string.uuid(), faker.string.uuid()]
      };

      const mockCreatedBook = {
        book_id: faker.string.uuid(),
        title: bookData.title,
        description: bookData.description,
        publisher_id: bookData.publisher_id,
        authors: bookData.authors.map((id) => ({ author_id: id })),
        created_at: new Date()
      } as unknown as Awaited<ReturnType<typeof app.prisma.book.create>>;

      vi.mocked(app.prisma.book.create).mockResolvedValueOnce(mockCreatedBook);

      const result = await bookRepository.createBook(bookData);

      expect(result).toEqual(mockCreatedBook);
    });

    it('should throw an error if prisma.book.create fails', async () => {
      const bookData = {
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        publisher_id: faker.string.uuid(),
        authors: [faker.string.uuid(), faker.string.uuid()]
      };

      const mockError = new Prisma.PrismaClientKnownRequestError('Create failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.book.create).mockRejectedValueOnce(mockError);

      await expect(bookRepository.createBook(bookData)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });
});
