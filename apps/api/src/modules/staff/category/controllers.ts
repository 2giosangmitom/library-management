import StaffCategoryService from './services';
import { CreateCategorySchema, DeleteCategorySchema } from './schemas';

export default class StaffCategoryController {
  private static instance: StaffCategoryController;
  private categoryService: StaffCategoryService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, categoryService: StaffCategoryService) {
    this.fastify = fastify;
    this.categoryService = categoryService;
  }

  public static getInstance(fastify: FastifyTypeBox, categoryService = StaffCategoryService.getInstance(fastify)) {
    if (!StaffCategoryController.instance) {
      StaffCategoryController.instance = new StaffCategoryController(fastify, categoryService);
    }
    return StaffCategoryController.instance;
  }

  public async createCategory(
    req: FastifyRequestTypeBox<typeof CreateCategorySchema>,
    reply: FastifyReplyTypeBox<typeof CreateCategorySchema>
  ) {
    const { name, slug } = req.body;

    const created = await this.categoryService.createCategory({ name, slug });

    return reply.status(201).send({
      message: 'Category created successfully.',
      data: {
        ...created,
        created_at: created.created_at.toISOString(),
        updated_at: created.updated_at.toISOString()
      }
    });
  }

  public async deleteCategory(
    req: FastifyRequestTypeBox<typeof DeleteCategorySchema>,
    reply: FastifyReplyTypeBox<typeof DeleteCategorySchema>
  ) {
    const { category_id } = req.params;

    const deleted = await this.categoryService.deleteCategory(category_id);

    return reply.status(200).send({ message: 'Category deleted successfully', data: deleted });
  }
}
