import { CreateAuthorSchema, DeleteAuthorSchema, GetAuthorBySlugSchema } from './author.schema';
import AuthorService from './author.service';

export default class AuthorController {
  private static instance: AuthorController;
  private authorService: AuthorService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, authorService: AuthorService) {
    this.fastify = fastify;
    this.authorService = authorService;
  }

  public static getInstance(fastify: FastifyTypeBox, authorService = AuthorService.getInstance(fastify)) {
    if (!AuthorController.instance) {
      AuthorController.instance = new AuthorController(fastify, authorService);
    }
    return AuthorController.instance;
  }

  public async createAuthor(
    req: FastifyRequestTypeBox<typeof CreateAuthorSchema>,
    reply: FastifyReplyTypeBox<typeof CreateAuthorSchema>
  ) {
    const { name, short_biography, biography, date_of_birth, date_of_death, nationality, slug } = req.body;

    const createdAuthor = await this.authorService.createAuthor({
      name,
      short_biography,
      biography,
      date_of_birth,
      date_of_death,
      nationality,
      slug
    });

    return reply.status(201).send({
      message: 'Author created successfully.',
      data: {
        ...createdAuthor,
        date_of_birth: createdAuthor.date_of_birth?.toISOString() || null,
        date_of_death: createdAuthor.date_of_death?.toISOString() || null,
        created_at: createdAuthor.created_at.toISOString(),
        updated_at: createdAuthor.updated_at.toISOString()
      }
    });
  }

  public async deleteAuthor(
    req: FastifyRequestTypeBox<typeof DeleteAuthorSchema>,
    reply: FastifyReplyTypeBox<typeof DeleteAuthorSchema>
  ) {
    const { author_id } = req.params;

    const deletedAuthor = await this.authorService.deleteAuthor(author_id);

    return reply.status(200).send({
      message: 'Author deleted successfully',
      data: deletedAuthor
    });
  }

  public async getAuthorBySlug(
    req: FastifyRequestTypeBox<typeof GetAuthorBySlugSchema>,
    reply: FastifyReplyTypeBox<typeof GetAuthorBySlugSchema>
  ) {
    const { slug } = req.params;

    const author = await this.authorService.getAuthorBySlug(slug);

    return reply.status(200).send({
      message: 'Author retrieved successfully',
      data: {
        ...author,
        date_of_birth: author.date_of_birth?.toISOString() || null,
        date_of_death: author.date_of_death?.toISOString() || null,
        created_at: author.created_at.toISOString(),
        updated_at: author.updated_at.toISOString()
      }
    });
  }
}
