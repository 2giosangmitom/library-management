import StaffAuthorService from '@/modules/staff/author/services.js';
import { buildMockFastify } from '../../../helpers/mockFastify.js';
import { faker } from '@faker-js/faker';
import { Prisma } from '@/generated/prisma/client.js';

describe('StaffAuthorService', async () => {
  const app = await buildMockFastify();
  const staffAuthorService = StaffAuthorService.getInstance(app);

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

      await staffAuthorService.createAuthor(authorData);

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

      await expect(staffAuthorService.createAuthor(authorData)).rejects.toThrowErrorMatchingInlineSnapshot(
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

      await expect(staffAuthorService.createAuthor(authorData)).rejects.toThrowError('Some other error');
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

      const result = await staffAuthorService.createAuthor(authorData);

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

      await staffAuthorService.deleteAuthor(authorId);

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

      const result = await staffAuthorService.deleteAuthor(authorId);

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

      await expect(staffAuthorService.deleteAuthor(authorId)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Author with the given ID does not exist.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const authorId = faker.string.uuid();

      // Mock Prisma to throw a generic error
      vi.mocked(app.prisma.author.delete).mockRejectedValueOnce(new Error('Some other error'));

      await expect(staffAuthorService.deleteAuthor(authorId)).rejects.toThrowError('Some other error');
    });
  });

  describe('updateAuthor', () => {
    it('should call prisma.author.update with correct author_id and data', async () => {
      const authorId = faker.string.uuid();
      const updateData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        slug: faker.lorem.slug(),
        nationality: faker.location.country()
      };

      await staffAuthorService.updateAuthor(authorId, updateData);

      expect(app.prisma.author.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            author_id: authorId
          },
          data: {
            ...updateData
          }
        })
      );
    });

    it('should return the updated author', async () => {
      const authorId = faker.string.uuid();
      const updateData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        slug: faker.lorem.slug(),
        nationality: faker.location.country()
      };

      const updatedAuthor = {
        ...updateData,
        author_id: authorId,
        date_of_birth: new Date(updateData.date_of_birth),
        date_of_death: null,
        created_at: faker.date.anytime(),
        updated_at: faker.date.anytime(),
        image_url: null
      } as unknown as Awaited<ReturnType<typeof app.prisma.author.update>>;

      // Mock Prisma to return the updated author
      vi.mocked(app.prisma.author.update).mockResolvedValueOnce(updatedAuthor);

      const result = await staffAuthorService.updateAuthor(authorId, updateData);

      expect(result).toEqual(updatedAuthor);
    });

    it('should throw 404 error if author to update does not exist', async () => {
      const authorId = faker.string.uuid();
      const updateData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        slug: faker.lorem.slug(),
        nationality: faker.location.country()
      };

      // Mock Prisma to throw not found error
      vi.mocked(app.prisma.author.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(staffAuthorService.updateAuthor(authorId, updateData)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Author with the given ID does not exist.]`
      );
    });

    it('should throw 409 error if slug conflicts with existing author', async () => {
      const authorId = faker.string.uuid();
      const updateData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        slug: faker.lorem.slug(),
        nationality: faker.location.country()
      };

      // Mock Prisma to throw unique constraint violation error
      vi.mocked(app.prisma.author.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(staffAuthorService.updateAuthor(authorId, updateData)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ConflictError: Author with the given slug already exists.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const authorId = faker.string.uuid();
      const updateData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        slug: faker.lorem.slug(),
        nationality: faker.location.country()
      };

      // Mock Prisma to throw a generic error
      vi.mocked(app.prisma.author.update).mockRejectedValueOnce(new Error('Some other error'));

      await expect(staffAuthorService.updateAuthor(authorId, updateData)).rejects.toThrowError('Some other error');
    });
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = StaffAuthorService.getInstance(app);
      const instance2 = StaffAuthorService.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });
});
