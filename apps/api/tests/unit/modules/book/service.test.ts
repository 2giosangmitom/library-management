import { BookModel } from '@modules/book/book.model';
import { BookService } from '@modules/book/book.service';
import { fastify } from 'fastify';

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
});
