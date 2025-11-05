import { BookModel } from '@modules/book/book.model';
import { BookService } from '@modules/book/book.service';
import { fastify } from 'fastify';
import { Prisma } from '@prisma/client';

describe('book service update', () => {
  const app = fastify();
  const bookModel = BookModel.getInstance(app);
  const bookService = BookService.getInstance(app, bookModel);

  afterAll(async () => {
    await app.close();
  });

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
