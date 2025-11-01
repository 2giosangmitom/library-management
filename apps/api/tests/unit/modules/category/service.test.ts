import { CategoryModel } from '@modules/category/category.model';
import { CategoryService } from '@modules/category/category.service';
import { fastify } from 'fastify';
import { Prisma } from '@prisma/client';

describe('category service', () => {
  const app = fastify();
  const categoryModel = CategoryModel.getInstance(app);
  const categoryService = CategoryService.getInstance(app, categoryModel);

  afterAll(async () => {
    await app.close();
  });

  describe('create category', () => {
    it('should return category data if creation is successful', async () => {
      vi.spyOn(categoryModel, 'createCategory').mockResolvedValueOnce({
        category_id: 'category-uuid',
        name: 'Category Name',
        slug: 'category-name',
        created_at: new Date()
      });

      await expect(
        categoryService.createCategory({
          name: 'Category Name',
          slug: 'category-name'
        })
      ).resolves.toEqual({
        category_id: 'category-uuid',
        name: 'Category Name',
        slug: 'category-name',
        created_at: expect.any(Date)
      });
    });

    it('should call createCategory with correct parameters', async () => {
      categoryModel.createCategory = vi.fn();

      const categoryData = {
        name: 'Category Name',
        slug: 'category-name'
      };

      await categoryService.createCategory(categoryData);

      expect(categoryModel.createCategory).toHaveBeenCalledWith(categoryData);
    });

    it('should throw an error if creation fails', async () => {
      vi.spyOn(categoryModel, 'createCategory').mockRejectedValueOnce(new Error('Creation failed'));

      await expect(
        categoryService.createCategory({
          name: 'Category Name',
          slug: 'category-name'
        })
      ).rejects.toThrow('Creation failed');
    });
  });

  describe('delete category', () => {
    beforeEach(() => {
      categoryModel.deleteCategory = vi.fn();
    });

    it('should return true if deletion is successful', async () => {
      vi.spyOn(categoryModel, 'deleteCategory').mockResolvedValueOnce({
        category_id: 'category-uuid',
        name: 'Category Name',
        slug: 'category-name',
        created_at: new Date(),
        updated_at: new Date()
      } as unknown as never);

      await expect(categoryService.deleteCategory('category-uuid')).resolves.toBe(true);
    });

    it('should call deleteCategory with correct parameters', async () => {
      const categoryId = 'category-uuid';
      await categoryService.deleteCategory(categoryId);
      expect(categoryModel.deleteCategory).toHaveBeenCalledWith(categoryId);
    });

    it('should return false if category not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('An error occurred', {
        code: 'P2025',
        clientVersion: '6.0.0'
      });
      vi.spyOn(categoryModel, 'deleteCategory').mockRejectedValueOnce(prismaError);

      await expect(categoryService.deleteCategory('non-existent-uuid')).resolves.toBe(false);
    });

    it('should re-throw other errors', async () => {
      const error = new Error('Something went wrong');
      vi.spyOn(categoryModel, 'deleteCategory').mockRejectedValueOnce(error);

      await expect(categoryService.deleteCategory('any-uuid')).rejects.toThrow('Something went wrong');
    });
  });
});
