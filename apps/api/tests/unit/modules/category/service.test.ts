import { CategoryModel } from '@modules/category/category.model';
import { CategoryService } from '@modules/category/category.service';
import { fastify } from 'fastify';

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
});
