import { BookModel } from '@modules/book/book.model';
import { BookService } from '@modules/book/book.service';
import { fastify } from 'fastify';
import { Prisma } from '@prisma/client';

describe('book service delete', () => {
  const app = fastify();
  const bookModel = BookModel.getInstance(app);
  const bookService = BookService.getInstance(app, bookModel);

  afterAll(async () => {
    await app.close();
  });

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
