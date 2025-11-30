import { CreateAuthorSchema, DeleteAuthorSchema, UpdateAuthorSchema } from './schemas.js';
import StaffAuthorService from './services.js';

export default class StaffAuthorController {
  private static instance: StaffAuthorController;
  private staffAuthorService: StaffAuthorService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, staffAuthorService: StaffAuthorService) {
    this.fastify = fastify;
    this.staffAuthorService = staffAuthorService;
  }

  public static getInstance(
    fastify: FastifyTypeBox,
    staffAuthorService = StaffAuthorService.getInstance(fastify)
  ): StaffAuthorController {
    if (!StaffAuthorController.instance) {
      StaffAuthorController.instance = new StaffAuthorController(fastify, staffAuthorService);
    }
    return StaffAuthorController.instance;
  }

  public async createAuthor(
    req: FastifyRequestTypeBox<typeof CreateAuthorSchema>,
    reply: FastifyReplyTypeBox<typeof CreateAuthorSchema>
  ) {
    const { name, short_biography, biography, date_of_birth, date_of_death, nationality, slug } = req.body;

    const createdAuthor = await this.staffAuthorService.createAuthor({
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

    const deletedAuthor = await this.staffAuthorService.deleteAuthor(author_id);

    return reply.status(200).send({
      message: 'Author deleted successfully',
      data: deletedAuthor
    });
  }

  public async updateAuthor(
    req: FastifyRequestTypeBox<typeof UpdateAuthorSchema>,
    reply: FastifyReplyTypeBox<typeof UpdateAuthorSchema>
  ) {
    const { author_id } = req.params;
    const { name, short_biography, biography, date_of_birth, date_of_death, nationality, slug } = req.body;

    const updatedAuthor = await this.staffAuthorService.updateAuthor(author_id, {
      name,
      short_biography,
      biography,
      date_of_birth,
      date_of_death,
      nationality,
      slug
    });

    return reply.status(200).send({
      message: 'Author updated successfully',
      data: {
        ...updatedAuthor,
        date_of_birth: updatedAuthor.date_of_birth?.toISOString() || null,
        date_of_death: updatedAuthor.date_of_death?.toISOString() || null,
        created_at: updatedAuthor.created_at.toISOString(),
        updated_at: updatedAuthor.updated_at.toISOString()
      }
    });
  }
}
