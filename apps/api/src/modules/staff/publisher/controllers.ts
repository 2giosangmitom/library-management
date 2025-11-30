import { CreatePublisherSchema, DeletePublisherSchema, UpdatePublisherSchema } from './schemas.js';
import StaffPublisherService from './services.js';

export default class StaffPublisherController {
  private static instance: StaffPublisherController;
  private staffPublisherService: StaffPublisherService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, staffPublisherService: StaffPublisherService) {
    this.fastify = fastify;
    this.staffPublisherService = staffPublisherService;
  }

  public static getInstance(
    fastify: FastifyTypeBox,
    staffPublisherService = StaffPublisherService.getInstance(fastify)
  ): StaffPublisherController {
    if (!StaffPublisherController.instance) {
      StaffPublisherController.instance = new StaffPublisherController(fastify, staffPublisherService);
    }
    return StaffPublisherController.instance;
  }

  public async createPublisher(
    req: FastifyRequestTypeBox<typeof CreatePublisherSchema>,
    reply: FastifyReplyTypeBox<typeof CreatePublisherSchema>
  ) {
    const { name, website, slug } = req.body;

    const created = await this.staffPublisherService.createPublisher({ name, website, slug });

    return reply.status(201).send({
      message: 'Publisher created successfully.',
      data: {
        ...created,
        created_at: created.created_at.toISOString(),
        updated_at: created.updated_at.toISOString()
      }
    });
  }

  public async deletePublisher(
    req: FastifyRequestTypeBox<typeof DeletePublisherSchema>,
    reply: FastifyReplyTypeBox<typeof DeletePublisherSchema>
  ) {
    const { publisher_id } = req.params;

    const deleted = await this.staffPublisherService.deletePublisher(publisher_id);

    return reply.status(200).send({ message: 'Publisher deleted successfully', data: deleted });
  }

  public async updatePublisher(
    req: FastifyRequestTypeBox<typeof UpdatePublisherSchema>,
    reply: FastifyReplyTypeBox<typeof UpdatePublisherSchema>
  ) {
    const { publisher_id } = req.params;
    const { name, website, slug } = req.body;

    const updated = await this.staffPublisherService.updatePublisher(publisher_id, {
      name,
      website,
      slug
    });

    return reply.status(200).send({
      message: 'Publisher updated successfully',
      data: {
        ...updated,
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString()
      }
    });
  }
}
