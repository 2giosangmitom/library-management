import { AuthorModel } from '@modules/author/author.model';
import { AuthorService } from '@modules/author/author.service';
import { fastify } from 'fastify';

describe('author service', () => {
  const app = fastify();
  const authorModel = AuthorModel.getInstance(app);
  const authorService = AuthorService.getInstance(app, authorModel);

  describe('create author', () => {
    beforeEach(() => {
      authorModel.createAuthor = vi.fn();
    });

    it('should return author data if creation is successful', async () => {
      vi.spyOn(authorModel, 'createAuthor').mockResolvedValueOnce({
        author_id: 'author-uuid',
        name: 'Author Name',
        biography: 'Author biography',
        short_biography: 'Ok phe',
        nationality: 'Some Nationality',
        slug: 'author-name',
        created_at: new Date()
      });

      await expect(
        authorService.createAuthor({
          name: 'Author Name',
          biography: 'Author biography',
          short_biography: 'Ok phe',
          nationality: 'Some Nationality',
          slug: 'author-name'
        })
      ).resolves.toEqual({
        author_id: 'author-uuid',
        name: 'Author Name',
        biography: 'Author biography',
        short_biography: 'Ok phe',
        nationality: 'Some Nationality',
        slug: 'author-name',
        created_at: expect.any(Date)
      });
    });

    it('should call createAuthor with correct parameters', async () => {
      const authorData = {
        name: 'Author Name',
        biography: 'Author biography',
        short_biography: 'Author short bio',
        nationality: 'Some Nationality',
        slug: 'author-name'
      };

      await authorService.createAuthor(authorData);

      expect(authorModel.createAuthor).toHaveBeenCalledWith(authorData);
    });
  });
});
