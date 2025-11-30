import StaffLocationController from './controllers';
import { AddLocationSchema } from './schemas';

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
