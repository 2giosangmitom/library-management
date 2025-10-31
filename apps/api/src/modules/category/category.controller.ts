import { createCategorySchema } from './category.schema';
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

  async createCategory(
    req: FastifyRequestTypeBox<typeof createCategorySchema>,
    reply: FastifyReplyTypeBox<typeof createCategorySchema>
  ) {
    const result = await this.categoryService.createCategory(req.body);
    return reply.status(201).send({
      ...result,
      created_at: result.created_at.toISOString()
    });
  }
}
