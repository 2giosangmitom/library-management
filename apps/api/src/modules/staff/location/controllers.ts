import { AddLocationSchema } from './schemas';
import StaffLocationService from './services';

export default class StaffLocationController {
  private static instance: StaffLocationController;
  private staffLocationService: StaffLocationService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, staffLocationService: StaffLocationService) {
    this.fastify = fastify;
    this.staffLocationService = staffLocationService;
  }

  public static getInstance(
    fastify: FastifyTypeBox,
    staffLocationService = StaffLocationService.getInstance(fastify)
  ): StaffLocationController {
    if (!StaffLocationController.instance) {
      StaffLocationController.instance = new StaffLocationController(fastify, staffLocationService);
    }
    return StaffLocationController.instance;
  }

  public async addLocation(
    req: FastifyRequestTypeBox<typeof AddLocationSchema>,
    res: FastifyReplyTypeBox<typeof AddLocationSchema>
  ) {
    const addedLocation = await this.staffLocationService.addLocation(req.body);

    return res.status(201).send({
      ...addedLocation,
      created_at: addedLocation.created_at.toISOString(),
      updated_at: addedLocation.updated_at.toISOString()
    });
  }
}
