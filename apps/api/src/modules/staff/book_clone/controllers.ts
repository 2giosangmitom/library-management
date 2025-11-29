import { CreateBookCloneSchema, DeleteBookCloneSchema } from './schemas';
import StaffBookCloneService from './services';

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
}
