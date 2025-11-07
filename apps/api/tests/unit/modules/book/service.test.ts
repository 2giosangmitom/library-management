import { BookModel } from '@modules/book/book.model';
import { BookService } from '@modules/book/book.service';
import { fastify } from 'fastify';
import { Prisma } from '@prisma/client';

describe('book service', () => {
  const app = fastify();
  const bookModel = BookModel.getInstance(app);
  const bookService = BookService.getInstance(app, bookModel);

  afterAll(async () => {
    await app.close();
  });

  describe('create book', () => {
    beforeEach(() => {
      bookModel.createBook = vi.fn();
    });

    it('should create a book and return data', async () => {
      const created = {
        book_id: 'book-uuid',
        title: 'Title',
        description: 'Desc',
        total_copies: 5,
        available_copies: 5,
        created_at: new Date()
      };

      vi.spyOn(bookModel, 'createBook').mockResolvedValueOnce(created);

      const result = await bookService.createBook({
        title: 'Title',
        description: 'Desc',
        total_copies: 5,
        author_ids: [],
        category_ids: []
      });

      expect(bookModel.createBook).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('should call createBook with correct parameters', async () => {
      bookModel.createBook = vi.fn();

      const bookData = {
        title: 'New Book',
        description: 'New Description',
        total_copies: 10,
        available_copies: 8,
        author_ids: ['author-uuid'],
        category_ids: ['category-uuid']
      };

      await bookService.createBook(bookData);

      expect(bookModel.createBook).toHaveBeenCalledWith({
        title: 'New Book',
        description: 'New Description',
        total_copies: 10,
        available_copies: 8,
        author_ids: ['author-uuid'],
        category_ids: ['category-uuid']
      });
    });

    it('should set available_copies to total_copies if not provided', async () => {
      bookModel.createBook = vi.fn();

      const bookData = {
        title: 'Another Book',
        description: 'Another Description',
        total_copies: 7,
        author_ids: ['author-uuid-2'],
        category_ids: ['category-uuid-2']
      };

      await bookService.createBook(bookData);
      expect(bookModel.createBook).toHaveBeenCalledWith({
        title: 'Another Book',
        description: 'Another Description',
        total_copies: 7,
        available_copies: 7,
        author_ids: ['author-uuid-2'],
        category_ids: ['category-uuid-2']
      });
    });
  });

  describe('delete book', () => {
    beforeEach(() => {
      bookModel.deleteBook = vi.fn();
    });

    it('should return true when deletion succeeds', async () => {
      bookModel.deleteBook = vi.fn();

      await expect(bookService.deleteBook('book-uuid')).resolves.toBe(true);
      expect(bookModel.deleteBook).toHaveBeenCalledWith('book-uuid');
    });

    it('should return false when book not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '6.0.0'
      });
      vi.spyOn(bookModel, 'deleteBook').mockRejectedValueOnce(prismaError);

      await expect(bookService.deleteBook('missing-id')).resolves.toBe(false);
    });

    it('should rethrow other errors', async () => {
      const error = new Error('boom');
      vi.spyOn(bookModel, 'deleteBook').mockRejectedValueOnce(error);

      await expect(bookService.deleteBook('id')).rejects.toThrow('boom');
    });
  });

  describe('update book', () => {
    beforeEach(() => {
      bookModel.updateBook = vi.fn();
    });

    it('should return updated book when successful', async () => {
      const updated = {
        book_id: 'book-uuid',
        title: 'New',
        description: 'D',
        total_copies: 2,
        available_copies: 2,
        updated_at: new Date()
      };

      vi.spyOn(bookModel, 'updateBook').mockResolvedValueOnce(updated);

      const result = await bookService.updateBook('book-uuid', { title: 'New' });

      expect(bookModel.updateBook).toHaveBeenCalledWith('book-uuid', { title: 'New' });
      expect(result).toEqual(updated);
    });

    it('should return null when book not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '6.0.0'
      });
      vi.spyOn(bookModel, 'updateBook').mockRejectedValueOnce(prismaError);

      const result = await bookService.updateBook('missing', { title: 'x' });
      expect(result).toBeNull();
    });

    it('should rethrow other errors', async () => {
      const error = new Error('boom');
      vi.spyOn(bookModel, 'updateBook').mockRejectedValueOnce(error);

      await expect(bookService.updateBook('id', { title: 'x' })).rejects.toThrow('boom');
    });
  });

  describe('get all books', () => {
    beforeEach(() => {
      bookModel.getAllBooks = vi.fn();
    });

    it('should return list of books', async () => {
      const books = [
        {
          book_id: 'book-1',
          title: 'Book One',
          description: 'Desc 1',
          total_copies: 3,
          available_copies: 2,
          authors: [],
          categories: [],
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          book_id: 'book-2',
          title: 'Book Two',
          description: 'Desc 2',
          total_copies: 5,
          available_copies: 5,
          authors: [],
          categories: [],
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      vi.spyOn(bookModel, 'getAllBooks').mockResolvedValueOnce(books);

      const result = await bookService.getAllBooks();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(books.length);
    });

    it('should call getAllBooks with correct parameters', async () => {
      bookModel.getAllBooks = vi.fn().mockResolvedValueOnce([]);

      await bookService.getAllBooks(2, 5);

      expect(bookModel.getAllBooks).toHaveBeenCalledWith(2, 5);
    });

    it('should use default pagination if none provided', async () => {
      bookModel.getAllBooks = vi.fn().mockResolvedValueOnce([]);

      await bookService.getAllBooks();

      expect(bookModel.getAllBooks).toHaveBeenCalledWith(1, 10);
    });

    it('should return formatted results', async () => {
      const fakeDate = new Date('2024-01-01T00:00:00Z');

      const books = [
        {
          book_id: 'book-1',
          title: 'Book One',
          description: 'Desc 1',
          total_copies: 3,
          available_copies: 2,
          authors: [
            {
              author: {
                author_id: 'author-1',
                name: 'Author One'
              }
            }
          ],
          categories: [
            {
              category: {
                category_id: 'category-1',
                name: 'Category One'
              }
            }
          ],
          created_at: fakeDate,
          updated_at: fakeDate
        }
      ];

      vi.spyOn(bookModel, 'getAllBooks').mockResolvedValueOnce(books);

      const result = await bookService.getAllBooks();

      expect(result).toEqual([
        {
          book_id: 'book-1',
          title: 'Book One',
          description: 'Desc 1',
          total_copies: 3,
          available_copies: 2,
          authors: [
            {
              author_id: 'author-1',
              name: 'Author One'
            }
          ],
          categories: [
            {
              category_id: 'category-1',
              name: 'Category One'
            }
          ],
          created_at: fakeDate.toISOString(),
          updated_at: fakeDate.toISOString()
        }
      ]);
    });
  });

  describe('get book by id', () => {
    beforeEach(() => {
      bookModel.getBookById = vi.fn();
    });

    it('should return book data when found', async () => {
      const book = {
        book_id: 'book-uuid',
        title: 'Some Book',
        description: 'Some Desc',
        total_copies: 4,
        available_copies: 4,
        authors: [],
        categories: [],
        created_at: new Date(),
        updated_at: new Date()
      };

      vi.spyOn(bookModel, 'getBookById').mockResolvedValueOnce(book);

      const result = await bookService.getBookById('book-uuid');

      expect(bookModel.getBookById).toHaveBeenCalledWith('book-uuid');
      expect(result).toEqual({
        ...book,
        created_at: book.created_at.toISOString(),
        updated_at: book.updated_at.toISOString()
      });
    });

    it('should return null when book not found', async () => {
      vi.spyOn(bookModel, 'getBookById').mockResolvedValueOnce(null);

      const result = await bookService.getBookById('missing-uuid');

      expect(result).toBeNull();
    });

    it('should format authors and categories correctly', async () => {
      const book = {
        book_id: 'book-uuid',
        title: 'Formatted Book',
        description: 'Formatted Desc',
        total_copies: 6,
        available_copies: 5,
        authors: [
          {
            author: {
              author_id: 'author-uuid',
              name: 'Author Name'
            }
          },
          {
            author: {
              author_id: 'author-uuid-2',
              name: 'Author Name 2'
            }
          }
        ],
        categories: [
          {
            category: {
              category_id: 'category-uuid',
              name: 'Category Name'
            }
          }
        ],
        created_at: new Date(),
        updated_at: new Date()
      };

      vi.spyOn(bookModel, 'getBookById').mockResolvedValueOnce(book);

      const result = await bookService.getBookById('book-uuid');

      expect(result).toEqual({
        book_id: 'book-uuid',
        title: 'Formatted Book',
        description: 'Formatted Desc',
        total_copies: 6,
        available_copies: 5,
        authors: [
          {
            author_id: 'author-uuid',
            name: 'Author Name'
          },
          {
            author_id: 'author-uuid-2',
            name: 'Author Name 2'
          }
        ],
        categories: [
          {
            category_id: 'category-uuid',
            name: 'Category Name'
          }
        ],
        created_at: book.created_at.toISOString(),
        updated_at: book.updated_at.toISOString()
      });
    });
  });
});
