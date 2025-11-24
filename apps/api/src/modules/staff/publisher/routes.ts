import StaffPublisherController from './controllers';
import { CreatePublisherSchema, DeletePublisherSchema } from './schemas';

export default function staffPublisherRoutes(fastify: FastifyTypeBox) {
  const controller = StaffPublisherController.getInstance(fastify);

  fastify.post('/', { schema: CreatePublisherSchema }, controller.createPublisher.bind(controller));
  fastify.delete('/:publisher_id', { schema: DeletePublisherSchema }, controller.deletePublisher.bind(controller));
}
