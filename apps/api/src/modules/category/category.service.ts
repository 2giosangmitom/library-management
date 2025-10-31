import { CategoryModel } from './category.model';

export class CategoryService {
  private static instance: CategoryService;
  private categoryModel: CategoryModel;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, categoryModel: CategoryModel) {
    this.fastify = fastify;
    this.categoryModel = categoryModel;
  }

  public static getInstance(fastify: FastifyTypeBox, categoryModel = CategoryModel.getInstance(fastify)) {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService(fastify, categoryModel);
    }
    return CategoryService.instance;
  }

  /**
   * Create a new category
   * @param data - The category data
   */
  public async createCategory(data: { name: string; slug: string }) {
    return this.categoryModel.createCategory(data);
  }
}
