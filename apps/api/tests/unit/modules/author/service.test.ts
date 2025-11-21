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
});
