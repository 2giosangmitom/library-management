import StaffPublisherController from './controllers.js';
import { CreatePublisherSchema, DeletePublisherSchema, UpdatePublisherSchema } from './schemas.js';

export default function staffPublisherRoutes(fastify: FastifyTypeBox) {
  const controller = StaffPublisherController.getInstance(fastify);

  fastify.post('/', { schema: CreatePublisherSchema }, controller.createPublisher.bind(controller));
  fastify.put('/:publisher_id', { schema: UpdatePublisherSchema }, controller.updatePublisher.bind(controller));
  fastify.delete('/:publisher_id', { schema: DeletePublisherSchema }, controller.deletePublisher.bind(controller));
}
