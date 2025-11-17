import { CategoryRepository } from './category.repository';
import { Prisma } from '@prisma/client';

export class CategoryService {
  private static instance: CategoryService;
  private categoryModel: CategoryRepository;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox, categoryModel: CategoryRepository) {
    this.fastify = fastify;
    this.categoryModel = categoryModel;
  }

  public static getInstance(fastify: FastifyTypeBox, categoryModel = CategoryRepository.getInstance(fastify)) {
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

  /**
   * Service method to get all categories
   */
  public getAllCategories(page = 1, limit = 10) {
    return this.categoryModel.getAllCategories(page, limit);
  }

  /**
   * Service method to get category details by slug
   * @param category_slug - Category slug
   */
  public getCategoryDetails(category_slug: string) {
    return this.categoryModel.getCategoryBySlug(category_slug);
  }
}
