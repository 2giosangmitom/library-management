import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from './category.schema';
import { CategoryService } from './category.service';

export class CategoryController {
  private static instance: CategoryController;
  private fastify: FastifyTypeBox;
  private categoryService: CategoryService;

  private constructor(fastify: FastifyTypeBox, categoryService: CategoryService) {
    this.fastify = fastify;
    this.categoryService = categoryService;
  }

  public static getInstance(
    fastify: FastifyTypeBox,
    categoryService = CategoryService.getInstance(fastify)
  ): CategoryController {
    if (!CategoryController.instance) {
      CategoryController.instance = new CategoryController(fastify, categoryService);
    }
    return CategoryController.instance;
  }

  /**
   * Route handler to create a new category
   */
  public async createCategory(
    req: FastifyRequestTypeBox<typeof createCategorySchema>,
    reply: FastifyReplyTypeBox<typeof createCategorySchema>
  ) {
    const result = await this.categoryService.createCategory(req.body);
    return reply.status(201).send({
      ...result,
      created_at: result.created_at.toISOString()
    });
  }

  /**
   * Route handler to delete a category
   */
  public async deleteCategory(
    req: FastifyRequestTypeBox<typeof deleteCategorySchema>,
    reply: FastifyReplyTypeBox<typeof deleteCategorySchema>
  ) {
    const { category_id } = req.params;
    const success = await this.categoryService.deleteCategory(category_id);

    if (!success) {
      return reply.status(404).send({ message: 'Category not found' });
    }

    return reply.status(204).send();
  }

  /**
   * Route handler to update a category
   */
  public async updateCategory(
    req: FastifyRequestTypeBox<typeof updateCategorySchema>,
    reply: FastifyReplyTypeBox<typeof updateCategorySchema>
  ) {
    const { category_id } = req.params;
    const updated = await this.categoryService.updateCategory(category_id, req.body);

    if (!updated) {
      return reply.status(404).send({ message: 'Category not found' });
    }

    return reply.send({
      ...updated,
      updated_at: updated.updated_at.toISOString()
    });
  }
}
