import StaffLocationController from './controllers';
import { AddLocationSchema, DeleteLocationSchema, UpdateLocationSchema, GetLocationsSchema } from './schemas';

export default function staffLocationRoutes(fastify: FastifyTypeBox) {
  const staffLocationController = StaffLocationController.getInstance(fastify);

  fastify.get(
    '/',
    {
      schema: GetLocationsSchema
    },
    staffLocationController.getLocations.bind(staffLocationController)
  );

  fastify.post(
    '/',
    {
      schema: AddLocationSchema
    },
    staffLocationController.addLocation.bind(staffLocationController)
  );

  fastify.delete(
    '/:location_id',
    {
      schema: DeleteLocationSchema
    },
    staffLocationController.deleteLocation.bind(staffLocationController)
  );

  fastify.put(
    '/:location_id',
    {
      schema: UpdateLocationSchema
    },
    staffLocationController.updateLocation.bind(staffLocationController)
  );
}
