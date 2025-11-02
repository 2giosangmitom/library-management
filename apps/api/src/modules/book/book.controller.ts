import { createBookSchema } from './book.schema';
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
}
