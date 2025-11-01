import { authMiddleware, isLibrarianMiddleware } from '@src/middlewares/auth';
import { CategoryController } from './category.controller';
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
  getAllCategoriesSchema,
  getCategoryDetailsSchema
} from './category.schema';

export default function categoryRoutes(fastify: FastifyTypeBox) {
  const categoryController = CategoryController.getInstance(fastify);

  // Public routes
  fastify.get('/', { schema: getAllCategoriesSchema }, categoryController.getAllCategories.bind(categoryController));
  fastify.get(
    '/:category_slug',
    { schema: getCategoryDetailsSchema },
    categoryController.getCategoryDetails.bind(categoryController)
  );

  // Librarian protected routes
  fastify.register(function librarianProtectedRoutes(instance) {
    instance.addHook('onRoute', (routeOptions) => {
      routeOptions.schema = routeOptions.schema || {};
      routeOptions.schema.security = [{ JWT: [] }];
    });
    instance.addHook('onRequest', authMiddleware);
    instance.addHook('onRequest', isLibrarianMiddleware);

    instance.post('/', { schema: createCategorySchema }, categoryController.createCategory.bind(categoryController));
    instance.delete(
      '/:category_id',
      { schema: deleteCategorySchema },
      categoryController.deleteCategory.bind(categoryController)
    );
    instance.put(
      '/:category_id',
      { schema: updateCategorySchema },
      categoryController.updateCategory.bind(categoryController)
    );
  });
}
