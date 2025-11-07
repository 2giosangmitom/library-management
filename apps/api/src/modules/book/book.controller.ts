import { createBookSchema, deleteBookSchema, getAllBooksSchema, updateBookSchema } from './book.schema';
import { BookService } from './book.service';

export class BookController {
  private static instance: BookController;
  private bookService: BookService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, bookService: BookService) {
    this.fastify = fastify;
    this.bookService = bookService;
  }

  public static getInstance(fastify: FastifyTypeBox, bookService = BookService.getInstance(fastify)) {
    if (!BookController.instance) {
      BookController.instance = new BookController(fastify, bookService);
    }
    return BookController.instance;
  }

  public async createBook(
    req: FastifyRequestTypeBox<typeof createBookSchema>,
    reply: FastifyReplyTypeBox<typeof createBookSchema>
  ) {
    const data = req.body;

    const created = await this.bookService.createBook(data);

    return reply.status(201).send({
      ...created,
      created_at: created.created_at.toISOString()
    });
  }

  /**
   * Delete a book by ID
   */
  public async deleteBook(
    req: FastifyRequestTypeBox<typeof deleteBookSchema>,
    reply: FastifyReplyTypeBox<typeof deleteBookSchema>
  ) {
    const { book_id } = req.params;

    try {
      const result = await this.bookService.deleteBook(book_id);

      if (!result) {
        return reply.status(404).send({ message: 'Book not found' });
      }

      return reply.status(204).send();
    } catch (err) {
      this.fastify.log.error({ err }, 'Error deleting book');
      throw err;
    }
  }

  /**
   * Update a book by ID
   */
  public async updateBook(
    req: FastifyRequestTypeBox<typeof updateBookSchema>,
    reply: FastifyReplyTypeBox<typeof updateBookSchema>
  ) {
    const { book_id } = req.params;
    const updated = await this.bookService.updateBook(book_id, req.body);

    if (!updated) {
      return reply.status(404).send({ message: 'Book not found' });
    }

    return reply.send({ ...updated, updated_at: updated.updated_at.toISOString() });
  }

  /**
   * Get all books
   */
  public async getAllBooks(
    req: FastifyRequestTypeBox<typeof getAllBooksSchema>,
    reply: FastifyReplyTypeBox<typeof getAllBooksSchema>
  ) {
    const { limit, page } = req.query;

    const books = await this.bookService.getAllBooks(page, limit);

    return reply.send(books);
  }
}
