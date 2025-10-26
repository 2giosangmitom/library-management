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

  describe('get all authors', () => {
    beforeEach(() => {
      authorModel.getAllAuthors = vi.fn();
    });

    it('should return a list of authors', async () => {
      vi.spyOn(authorModel, 'getAllAuthors').mockResolvedValueOnce([
        {
          name: 'Author One',
          short_biography: 'Short Bio One',
          slug: 'author-one'
        },
        {
          name: 'Author Two',
          short_biography: 'Short Bio Two',
          slug: 'author-two'
        }
      ]);

      await expect(authorService.getAllAuthors()).resolves.toEqual([
        {
          name: 'Author One',
          short_biography: 'Short Bio One',
          slug: 'author-one'
        },
        {
          name: 'Author Two',
          short_biography: 'Short Bio Two',
          slug: 'author-two'
        }
      ]);
    });

    it('should call getAllAuthors with default parameters', async () => {
      await authorService.getAllAuthors();

      expect(authorModel.getAllAuthors).toHaveBeenCalledWith(1, 10);
    });

    it('should call getAllAuthors with provided parameters', async () => {
      await authorService.getAllAuthors(2, 5);

      expect(authorModel.getAllAuthors).toHaveBeenCalledWith(2, 5);
    });
  });

  describe('get author by slug', () => {
    beforeEach(() => {
      authorModel.getAuthorBySlug = vi.fn();
    });

    it('should return author data if found', async () => {
      vi.spyOn(authorModel, 'getAuthorBySlug').mockResolvedValueOnce({
        name: 'Author Name',
        biography: 'Author biography',
        short_biography: 'Ok phe',
        nationality: 'Some Nationality',
        slug: 'author-name'
      });

      await expect(authorService.getAuthorDetails('author-name')).resolves.toEqual({
        name: 'Author Name',
        biography: 'Author biography',
        short_biography: 'Ok phe',
        nationality: 'Some Nationality',
        slug: 'author-name'
      });
    });

    it('should call getAuthorBySlug with correct slug', async () => {
      const slug = 'author-name';

      await authorService.getAuthorDetails(slug);

      expect(authorModel.getAuthorBySlug).toHaveBeenCalledWith(slug);
    });

    it('should return null if author not found', async () => {
      vi.spyOn(authorModel, 'getAuthorBySlug').mockResolvedValueOnce(null);

      await expect(authorService.getAuthorDetails('non-existent-slug')).resolves.toBeNull();
    });
  });
});
