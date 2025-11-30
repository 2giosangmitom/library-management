import StaffCategoryController from './controllers.js';
import { CreateCategorySchema, DeleteCategorySchema, UpdateCategorySchema } from './schemas.js';

export default function staffCategoryRoutes(fastify: FastifyTypeBox) {
  const controller = StaffCategoryController.getInstance(fastify);

  fastify.post('/', { schema: CreateCategorySchema }, controller.createCategory.bind(controller));
  fastify.delete('/:category_id', { schema: DeleteCategorySchema }, controller.deleteCategory.bind(controller));
  fastify.put('/:category_id', { schema: UpdateCategorySchema }, controller.updateCategory.bind(controller));
}
