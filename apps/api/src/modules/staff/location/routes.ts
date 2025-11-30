import StaffLocationController from './controllers.js';
import { AddLocationSchema } from './schemas.js';

export default function staffLocationRoutes(fastify: FastifyTypeBox) {
  const staffLocationController = StaffLocationController.getInstance(fastify);

  fastify.post(
    '/',
    {
      schema: AddLocationSchema
    },
    staffLocationController.addLocation.bind(staffLocationController)
  );
}
