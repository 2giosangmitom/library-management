import { AddLocationSchema, DeleteLocationSchema, UpdateLocationSchema } from './schemas';
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

  public async deleteLocation(
    req: FastifyRequestTypeBox<typeof DeleteLocationSchema>,
    res: FastifyReplyTypeBox<typeof DeleteLocationSchema>
  ) {
    const { location_id } = req.params;

    const deletedLocation = await this.staffLocationService.deleteLocation(location_id);

    return res.status(200).send({
      message: 'Location deleted successfully',
      data: deletedLocation
    });
  }

  public async updateLocation(
    req: FastifyRequestTypeBox<typeof UpdateLocationSchema>,
    res: FastifyReplyTypeBox<typeof UpdateLocationSchema>
  ) {
    const { location_id } = req.params;
    const { room, floor, shelf, row } = req.body;

    const updatedLocation = await this.staffLocationService.updateLocation(location_id, {
      room,
      floor,
      shelf,
      row
    });

    return res.status(200).send({
      message: 'Location updated successfully',
      data: {
        ...updatedLocation,
        created_at: updatedLocation.created_at.toISOString(),
        updated_at: updatedLocation.updated_at.toISOString()
      }
    });
  }
}
