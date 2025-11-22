import AuthorService from '@modules/author/author.service';
import { buildMockFastify } from '@tests/unit/helpers/mockFastify';
import { faker } from '@faker-js/faker';
import { Prisma } from '@src/generated/prisma/client';

describe('AuthorService', async () => {
  const app = await buildMockFastify();
  const authorService = AuthorService.getInstance(app);

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('createAuthor', () => {
    it('should call prisma.author.create with correct data', async () => {
      const authorData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        slug: faker.lorem.slug(),
        nationality: faker.location.country()
      };

      await authorService.createAuthor(authorData);

      expect(app.prisma.author.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ...authorData
          }
        })
      );
    });

    it('should throw conflict error if slug already exists', async () => {
      const authorData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        slug: faker.lorem.slug(),
        nationality: faker.location.country()
      };

      // Mock Prisma to throw unique constraint error
      vi.mocked(app.prisma.author.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(authorService.createAuthor(authorData)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ConflictError: Author with the given slug already exists.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const authorData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        slug: faker.lorem.slug(),
        nationality: faker.location.country()
      };

      // Mock Prisma to throw a generic error
      vi.mocked(app.prisma.author.create).mockRejectedValueOnce(new Error('Some other error'));

      await expect(authorService.createAuthor(authorData)).rejects.toThrowError('Some other error');
    });

    it('should return the created author on success', async () => {
      const authorData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        slug: faker.lorem.slug(),
        nationality: faker.location.country()
      };

      // Mock Prisma to return the created author
      vi.mocked(app.prisma.author.create).mockResolvedValueOnce({
        ...authorData,
        author_id: faker.string.uuid(),
        date_of_birth: faker.date.past(),
        date_of_death: null,
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime(),
        image_url: null
      });

      const result = await authorService.createAuthor(authorData);

      expect(result).toEqual(
        expect.objectContaining({
          ...authorData,
          author_id: expect.any(String),
          date_of_birth: expect.any(Date),
          date_of_death: null,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          image_url: null
        })
      );
    });
  });

  describe('deleteAuthor', () => {
    it('should call prisma.author.delete with correct author_id', async () => {
      const authorId = faker.string.uuid();

      await authorService.deleteAuthor(authorId);

      expect(app.prisma.author.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            author_id: authorId
          }
        })
      );
    });

    it('should return the deleted author', async () => {
      const authorId = faker.string.uuid();
      const deletedAuthor = {
        author_id: authorId,
        name: faker.person.fullName()
      } as unknown as Awaited<ReturnType<typeof app.prisma.author.delete>>;

      // Mock Prisma to return the deleted author
      vi.mocked(app.prisma.author.delete).mockResolvedValueOnce(deletedAuthor);

      const result = await authorService.deleteAuthor(authorId);

      expect(result).toEqual(deletedAuthor);
    });

    it("should throw 404 error if author doesn't exist", async () => {
      const authorId = faker.string.uuid();

      // Mock Prisma to throw not found error
      vi.mocked(app.prisma.author.delete).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(authorService.deleteAuthor(authorId)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Author with the given ID does not exist.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const authorId = faker.string.uuid();

      // Mock Prisma to throw a generic error
      vi.mocked(app.prisma.author.delete).mockRejectedValueOnce(new Error('Some other error'));

      await expect(authorService.deleteAuthor(authorId)).rejects.toThrowError('Some other error');
    });
  });

  describe('getAuthorBySlug', () => {
    it('should call prisma.author.findUnique with correct slug', async () => {
      const slug = faker.lorem.slug();

      vi.mocked(app.prisma.author.findUnique).mockResolvedValueOnce(
        {} as unknown as Awaited<ReturnType<typeof app.prisma.author.findUnique>> // Prevent undefined return
      );
      await authorService.getAuthorBySlug(slug);

      expect(app.prisma.author.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug
          }
        })
      );
    });

    it('should return the author if found', async () => {
      const slug = faker.lorem.slug();
      const author = {
        author_id: faker.string.uuid(),
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past(),
        date_of_death: null,
        slug,
        nationality: faker.location.country(),
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime(),
        image_url: null
      } as unknown as Awaited<ReturnType<typeof app.prisma.author.findUnique>>;

      // Mock Prisma to return the author
      vi.mocked(app.prisma.author.findUnique).mockResolvedValueOnce(author);

      const result = await authorService.getAuthorBySlug(slug);

      expect(result).toEqual(author);
    });

    it("should throw 404 error if author with given slug doesn't exist", async () => {
      const slug = faker.lorem.slug();

      // Mock Prisma to return null (not found)
      vi.mocked(app.prisma.author.findUnique).mockResolvedValueOnce(null);

      await expect(authorService.getAuthorBySlug(slug)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Author with the given slug does not exist.]`
      );
    });
  });
});
