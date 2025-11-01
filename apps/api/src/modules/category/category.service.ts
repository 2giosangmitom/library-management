import { CategoryModel } from './category.model';
import { Prisma } from '@prisma/client';

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

  /**
   * Delete a category by ID
   * @param category_id - The category ID
   * @returns true if deleted, false if not found
   */
  public async deleteCategory(category_id: string) {
    try {
      await this.categoryModel.deleteCategory(category_id);
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Update a category by ID
   * @param category_id - The category ID
   * @param data - The category data
   * @returns Updated category or null if not found
   */
  public async updateCategory(category_id: string, data: { name: string; slug: string }) {
    try {
      return await this.categoryModel.updateCategory(category_id, data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }
}
