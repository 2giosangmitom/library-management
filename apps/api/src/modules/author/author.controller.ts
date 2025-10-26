import { createAuthorSchema } from './author.schema';
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
}
