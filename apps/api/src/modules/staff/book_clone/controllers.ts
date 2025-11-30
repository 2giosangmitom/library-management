import { CreateBookCloneSchema, DeleteBookCloneSchema, UpdateBookCloneSchema } from './schemas.js';
import StaffBookCloneService from './services.js';

export default class StaffBookCloneController {
  private static instance: StaffBookCloneController;
  private staffBookCloneService: StaffBookCloneService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, staffBookCloneService: StaffBookCloneService) {
    this.fastify = fastify;
    this.staffBookCloneService = staffBookCloneService;
  }

  public static getInstance(
    fastify: FastifyTypeBox,
    staffBookCloneService = StaffBookCloneService.getInstance(fastify)
  ): StaffBookCloneController {
    if (!StaffBookCloneController.instance) {
      StaffBookCloneController.instance = new StaffBookCloneController(fastify, staffBookCloneService);
    }
    return StaffBookCloneController.instance;
  }

  public async createBookClone(
    req: FastifyRequestTypeBox<typeof CreateBookCloneSchema>,
    reply: FastifyReplyTypeBox<typeof CreateBookCloneSchema>
  ) {
    const { book_id, location_id, barcode, condition } = req.body;

    const createdBookClone = await this.staffBookCloneService.createBookClone({
      book_id,
      location_id,
      barcode,
      condition
    });

    return reply.code(201).send({
      message: 'Book clone created successfully',
      data: {
        book_clone_id: createdBookClone.book_clone_id,
        book_id: createdBookClone.book_id,
        location_id: createdBookClone.location_id,
        barcode: createdBookClone.barcode,
        condition: createdBookClone.condition,
        is_available: createdBookClone.is_available,
        created_at: createdBookClone.created_at.toISOString(),
        updated_at: createdBookClone.updated_at.toISOString()
      }
    });
  }

  public async deleteBookClone(
    req: FastifyRequestTypeBox<typeof DeleteBookCloneSchema>,
    reply: FastifyReplyTypeBox<typeof DeleteBookCloneSchema>
  ) {
    const { book_clone_id } = req.params;

    const deleted = await this.staffBookCloneService.deleteBookClone(book_clone_id);

    return reply.status(200).send({
      message: 'Book clone deleted successfully',
      data: deleted
    });
  }

  public async updateBookClone(
    req: FastifyRequestTypeBox<typeof UpdateBookCloneSchema>,
    reply: FastifyReplyTypeBox<typeof UpdateBookCloneSchema>
  ) {
    const { book_clone_id } = req.params;
    const { book_id, location_id, barcode, condition } = req.body;

    const updated = await this.staffBookCloneService.updateBookClone(book_clone_id, {
      book_id,
      location_id,
      barcode,
      condition
    });

    return reply.status(200).send({
      message: 'Book clone updated successfully',
      data: {
        ...updated,
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString()
      }
    });
  }
}
