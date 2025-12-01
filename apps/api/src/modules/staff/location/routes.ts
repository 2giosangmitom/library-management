import StaffLocationController from './controllers';
import { AddLocationSchema, DeleteLocationSchema, UpdateLocationSchema } from './schemas';

export default function staffLocationRoutes(fastify: FastifyTypeBox) {
  const staffLocationController = StaffLocationController.getInstance(fastify);

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
