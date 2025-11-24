import StaffCategoryController from './controllers';
import { CreateCategorySchema, DeleteCategorySchema } from './schemas';

export default function staffCategoryRoutes(fastify: FastifyTypeBox) {
  const controller = StaffCategoryController.getInstance(fastify);

  fastify.post('/', { schema: CreateCategorySchema }, controller.createCategory.bind(controller));
  fastify.delete('/:category_id', { schema: DeleteCategorySchema }, controller.deleteCategory.bind(controller));
}
