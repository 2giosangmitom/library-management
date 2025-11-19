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
      },
      rating: {
        groupBy: vi.fn()
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
        authors: [faker.string.uuid(), faker.string.uuid()],
        categories: [faker.string.uuid(), faker.string.uuid()]
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
        },
        categories: {
          createMany: {
            data: [{ category_id: bookData.categories[0] }, { category_id: bookData.categories[1] }],
            skipDuplicates: true
          }
        }
      };

      await bookRepository.createBook(bookData);

      expect(app.prisma.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expectedData
        })
      );
    });

    it('should return the created book', async () => {
      const bookData = {
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        publisher_id: faker.string.uuid(),
        authors: [faker.string.uuid(), faker.string.uuid()],
        categories: [faker.string.uuid(), faker.string.uuid()]
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
        authors: [faker.string.uuid(), faker.string.uuid()],
        categories: [faker.string.uuid(), faker.string.uuid()]
      };

      const mockError = new Prisma.PrismaClientKnownRequestError('Create failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.book.create).mockRejectedValueOnce(mockError);

      await expect(bookRepository.createBook(bookData)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('findBookById', () => {
    it("should return null if the book doesn't exist", async () => {
      const bookId = faker.string.uuid();

      vi.mocked(app.prisma.book.findUnique).mockResolvedValueOnce(null);

      const result = await bookRepository.findBookById(bookId);

      expect(result).toBeNull();
    });

    it('should call prisma.book.findUnique with correct parameters', async () => {
      const bookId = faker.string.uuid();

      await bookRepository.findBookById(bookId);

      expect(app.prisma.book.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_id: bookId }
        })
      );
    });

    it('should include ratings when opts.includeRatings is true', async () => {
      const bookId = faker.string.uuid();

      await bookRepository.findBookById(bookId, { includeRatings: true });

      expect(app.prisma.book.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_id: bookId },
          select: expect.objectContaining({
            ratings: expect.any(Object)
          })
        })
      );
    });

    it('should not include ratings when opts.includeRatings is false', async () => {
      const bookId = faker.string.uuid();

      await bookRepository.findBookById(bookId, { includeRatings: false });

      expect(app.prisma.book.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_id: bookId },
          select: expect.objectContaining({
            ratings: false
          })
        })
      );
    });
  });

  describe('deleteBookById', () => {
    it('should call prisma.book.delete with correct parameters', async () => {
      const bookId = faker.string.uuid();

      await bookRepository.deleteBookById(bookId);

      expect(app.prisma.book.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_id: bookId }
        })
      );
    });

    it('should return the deleted book', async () => {
      const bookId = faker.string.uuid();
      const mockDeletedBook = {
        title: faker.lorem.words(3)
      } as unknown as Awaited<ReturnType<typeof app.prisma.book.delete>>;

      vi.mocked(app.prisma.book.delete).mockResolvedValueOnce(mockDeletedBook);

      const result = await bookRepository.deleteBookById(bookId);

      expect(result).toEqual(mockDeletedBook);
    });

    it('should throw an error if prisma.book.delete fails', async () => {
      const bookId = faker.string.uuid();

      const mockError = new Prisma.PrismaClientKnownRequestError('Delete failed', {
        code: 'P2025',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.book.delete).mockRejectedValueOnce(mockError);

      await expect(bookRepository.deleteBookById(bookId)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('updateBookById', () => {
    it('should call prisma.book.update with correct parameters', async () => {
      const bookId = faker.string.uuid();
      const updateData = {
        title: faker.lorem.words(4),
        description: faker.lorem.sentence(),
        publisher_id: faker.string.uuid(),
        authors: [faker.string.uuid(), faker.string.uuid()]
      };

      const expectedData = {
        title: updateData.title,
        description: updateData.description,
        publisher_id: updateData.publisher_id,
        authors: {
          deleteMany: {},
          createMany: {
            data: [{ author_id: updateData.authors[0] }, { author_id: updateData.authors[1] }],
            skipDuplicates: true
          }
        }
      };

      await bookRepository.updateBookById(bookId, updateData);

      expect(app.prisma.book.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_id: bookId },
          data: expectedData
        })
      );
    });

    it('should return the updated book', async () => {
      const bookId = faker.string.uuid();
      const updateData = {
        title: faker.lorem.words(4),
        description: faker.lorem.sentence(),
        publisher_id: faker.string.uuid(),
        authors: [faker.string.uuid(), faker.string.uuid()]
      };

      const mockUpdatedBook = {
        book_id: bookId,
        title: updateData.title,
        description: updateData.description,
        publisher: {
          slug: faker.lorem.word(),
          name: faker.company.name()
        }
      } as unknown as Awaited<ReturnType<typeof app.prisma.book.update>>;

      vi.mocked(app.prisma.book.update).mockResolvedValueOnce(mockUpdatedBook);

      const result = await bookRepository.updateBookById(bookId, updateData);

      expect(result).toEqual(mockUpdatedBook);
    });

    it('should throw an error if prisma.book.update fails', async () => {
      const bookId = faker.string.uuid();
      const updateData = {
        title: faker.lorem.words(4),
        description: faker.lorem.sentence(),
        publisher_id: faker.string.uuid(),
        authors: [faker.string.uuid(), faker.string.uuid()]
      };

      const mockError = new Prisma.PrismaClientKnownRequestError('Update failed', {
        code: 'P2025',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.book.update).mockRejectedValueOnce(mockError);

      await expect(bookRepository.updateBookById(bookId, updateData)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError
      );
    });

    it('should include ratings when opts.includeRatings is true', async () => {
      const bookId = faker.string.uuid();
      const updateData = {
        title: faker.lorem.words(4)
      };

      await bookRepository.updateBookById(bookId, updateData, { includeRatings: true });

      expect(app.prisma.book.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_id: bookId },
          select: expect.objectContaining({
            ratings: expect.any(Object)
          })
        })
      );
    });

    it('should not include ratings when opts.includeRatings is false', async () => {
      const bookId = faker.string.uuid();
      const updateData = {
        title: faker.lorem.words(4)
      };

      await bookRepository.updateBookById(bookId, updateData, { includeRatings: false });

      expect(app.prisma.book.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_id: bookId },
          select: expect.objectContaining({
            ratings: false
          })
        })
      );
    });
  });

  describe('findAllBooks', () => {
    it('should call prisma.book.findMany with correct parameters', async () => {
      const page = 2;
      const pageSize = 5;
      vi.mocked(app.prisma.$transaction).mockResolvedValueOnce([2, []]);

      await bookRepository.findAllBooks(page, pageSize);

      expect(app.prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * pageSize,
          take: pageSize
        })
      );
    });

    it('should call prisma.book.count once', async () => {
      const page = 1;
      const pageSize = 10;
      vi.mocked(app.prisma.$transaction).mockResolvedValueOnce([2, []]);

      await bookRepository.findAllBooks(page, pageSize);

      expect(app.prisma.book.count).toHaveBeenCalledOnce();
    });

    it('should call prisma.rating.groupBy when books array is not empty', async () => {
      const page = 1;
      const pageSize = 10;
      const mockBooks = [
        { book_id: faker.string.uuid(), title: faker.lorem.words(3) },
        { book_id: faker.string.uuid(), title: faker.lorem.words(4) }
      ];
      vi.mocked(app.prisma.$transaction).mockResolvedValueOnce([2, mockBooks]);

      const groupBySpy = vi.spyOn(app.prisma.rating, 'groupBy').mockResolvedValueOnce([]);

      await bookRepository.findAllBooks(page, pageSize);

      expect(groupBySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { book_id: { in: [mockBooks[0]?.book_id, mockBooks[1]?.book_id] } }
        })
      );
    });

    it('should not call prisma.rating.groupBy when books array is empty', async () => {
      const page = 1;
      const pageSize = 10;
      vi.mocked(app.prisma.$transaction).mockResolvedValueOnce([0, []]);

      const groupBySpy = vi.spyOn(app.prisma.rating, 'groupBy');

      await bookRepository.findAllBooks(page, pageSize);

      expect(groupBySpy).not.toHaveBeenCalled();
    });

    it('should return total and books with rating stats', async () => {
      const page = 1;
      const pageSize = 10;
      const mockBooks = [
        { book_id: faker.string.uuid(), title: faker.lorem.words(3) },
        { book_id: faker.string.uuid(), title: faker.lorem.words(4) }
      ];
      const mockRatings = [
        { book_id: mockBooks[0]?.book_id, _avg: { rate: 4.5 }, _count: { rate: 2 } },
        { book_id: mockBooks[1]?.book_id, _avg: { rate: 3.0 }, _count: { rate: 1 } }
      ] as unknown as Awaited<ReturnType<typeof app.prisma.rating.groupBy>>;
      vi.mocked(app.prisma.$transaction).mockResolvedValueOnce([2, mockBooks]);
      vi.mocked(app.prisma.rating.groupBy).mockResolvedValueOnce(mockRatings);

      const result = await bookRepository.findAllBooks(page, pageSize);

      expect(result).toEqual({
        total: 2,
        data: [
          {
            ...mockBooks[0],
            ratings: { average: 4.5, total: 2 }
          },
          {
            ...mockBooks[1],
            ratings: { average: 3.0, total: 1 }
          }
        ]
      });
    });
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = BookRepository.getInstance(app);
      const instance2 = BookRepository.getInstance(app);

      expect(instance1).toBe(instance2);
    });
  });
});
