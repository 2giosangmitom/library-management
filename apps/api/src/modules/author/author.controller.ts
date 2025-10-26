import { createAuthorSchema, getAllAuthorsSchema, getAuthorDetailsSchema } from './author.schema';
import { AuthorService } from './author.service';

export class AuthorController {
  private static instance: AuthorController;
  private authorService: AuthorService;

  private constructor(authorService: AuthorService) {
    this.authorService = authorService;
  }

  public static getInstance(
    fastify: FastifyTypeBox,
    authorService = AuthorService.getInstance(fastify)
  ): AuthorController {
    if (!AuthorController.instance) {
      AuthorController.instance = new AuthorController(authorService);
    }
    return AuthorController.instance;
  }

  /**
   * Route handler to create a new author
   */
  public async createAuthor(
    req: FastifyRequestTypeBox<typeof createAuthorSchema>,
    reply: FastifyReplyTypeBox<typeof createAuthorSchema>
  ) {
    const newAuthor = await this.authorService.createAuthor(req.body);
    return reply.status(201).send({
      ...newAuthor,
      created_at: newAuthor.created_at.toISOString()
    });
  }

  /**
   * Route handler to get all authors
   */
  public async getAllAuthors(
    req: FastifyRequestTypeBox<typeof getAllAuthorsSchema>,
    reply: FastifyReplyTypeBox<typeof getAllAuthorsSchema>
  ) {
    const { limit, page } = req.query;
    const authors = await this.authorService.getAllAuthors(page, limit);
    return reply.send(authors);
  }

  /**
   * Route handler to get author details
   */
  public async getAuthorDetails(
    req: FastifyRequestTypeBox<typeof getAuthorDetailsSchema>,
    reply: FastifyReplyTypeBox<typeof getAuthorDetailsSchema>
  ) {
    const { author_slug } = req.params;
    const author = await this.authorService.getAuthorDetails(author_slug);

    if (!author) {
      return reply.status(404).send({ message: 'Author not found' });
    }

    return reply.send(author);
  }
}
