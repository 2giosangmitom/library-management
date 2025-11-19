import { AuthorRepository } from '@modules/author/author.repository';
import fastify from 'fastify';
import { Prisma, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('AuthorRepository', () => {
  const app = fastify();
  const authorRepository = AuthorRepository.getInstance(app);

  beforeAll(() => {
    app.decorate('prisma', {
      $transaction: vi.fn(),
      author: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        delete: vi.fn()
      }
    } as unknown as PrismaClient);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAuthor', () => {
    it("should call prisma's create with correct data", async () => {
      const authorData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        nationality: faker.location.country(),
        date_of_birth: faker.date.anytime().toISOString(),
        date_of_death: faker.date.anytime().toISOString(),
        slug: faker.lorem.slug()
      };

      await authorRepository.createAuthor(authorData);

      expect(app.prisma.author.create).toHaveBeenCalledWith({
        select: {
          author_id: true,
          name: true,
          short_biography: true,
          biography: true,
          nationality: true,
          date_of_birth: true,
          date_of_death: true,
          slug: true,
          created_at: true,
          updated_at: true
        },
        data: authorData
      });
    });

    it('should return the created author', async () => {
      const authorData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        nationality: faker.location.country(),
        date_of_birth: faker.date.anytime().toISOString(),
        date_of_death: faker.date.anytime().toISOString(),
        slug: faker.lorem.slug()
      };

      const createdAuthor = {
        author_id: faker.string.uuid(),
        ...authorData,
        created_at: new Date()
      } as unknown as Awaited<ReturnType<typeof app.prisma.author.create>>;

      vi.mocked(app.prisma.author.create).mockResolvedValueOnce(createdAuthor);

      const result = await authorRepository.createAuthor(authorData);

      expect(result).toEqual(createdAuthor);
    });

    it('should throw an error if prisma create fails', async () => {
      const authorData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        nationality: faker.location.country(),
        date_of_birth: faker.date.anytime().toISOString(),
        date_of_death: faker.date.anytime().toISOString(),
        slug: faker.lorem.slug()
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma create failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.author.create).mockRejectedValueOnce(prismaError);

      await expect(authorRepository.createAuthor(authorData)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('deleteAuthor', () => {
    it("should call prisma's delete with correct author_id", async () => {
      const author_id = faker.string.uuid();

      await authorRepository.deleteAuthor(author_id);

      expect(app.prisma.author.delete).toHaveBeenCalledWith({
        select: { name: true },
        where: { author_id }
      });
    });

    it('should return the deleted author name', async () => {
      const author_id = faker.string.uuid();
      const deletedAuthor = {
        name: faker.person.fullName()
      } as unknown as Awaited<ReturnType<typeof app.prisma.author.delete>>;

      vi.mocked(app.prisma.author.delete).mockResolvedValueOnce(deletedAuthor);

      const result = await authorRepository.deleteAuthor(author_id);

      expect(result).toEqual(deletedAuthor);
    });

    it('should throw an error if prisma delete fails', async () => {
      const author_id = faker.string.uuid();

      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma delete failed', {
        code: 'P2025',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.author.delete).mockRejectedValueOnce(prismaError);

      await expect(authorRepository.deleteAuthor(author_id)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });

  describe('updateAuthor', () => {
    it("should call prisma's update with correct data", async () => {
      const author_id = faker.string.uuid();
      const updateData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence()
      };

      await authorRepository.updateAuthor(author_id, updateData);

      expect(app.prisma.author.update).toHaveBeenCalledWith({
        where: { author_id },
        select: {
          author_id: true,
          name: true,
          short_biography: true,
          biography: true,
          nationality: true,
          date_of_birth: true,
          date_of_death: true,
          slug: true,
          created_at: true,
          updated_at: true
        },
        data: updateData
      });
    });

    it('should throw an error if prisma update fails', async () => {
      const author_id = faker.string.uuid();
      const updateData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence()
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma update failed', {
        code: 'P2025',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.author.update).mockRejectedValueOnce(prismaError);

      await expect(authorRepository.updateAuthor(author_id, updateData)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError
      );
    });

    it('should return the updated author', async () => {
      const author_id = faker.string.uuid();
      const updateData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence()
      };

      const updatedAuthor = {
        author_id,
        ...updateData,
        biography: faker.lorem.paragraphs(2),
        nationality: faker.location.country(),
        date_of_birth: faker.date.past(),
        date_of_death: faker.date.past(),
        slug: faker.lorem.slug(),
        updated_at: new Date()
      } as unknown as Awaited<ReturnType<typeof app.prisma.author.update>>;

      vi.mocked(app.prisma.author.update).mockResolvedValueOnce(updatedAuthor);

      const result = await authorRepository.updateAuthor(author_id, updateData);

      expect(result).toEqual(updatedAuthor);
    });
  });

  describe('findAuthorBySlug', () => {
    it("should call prisma's findUnique with correct author_slug", async () => {
      const author_slug = faker.lorem.slug();

      await authorRepository.findAuthorBySlug(author_slug);

      expect(app.prisma.author.findUnique).toHaveBeenCalledWith({
        where: { slug: author_slug },
        select: {
          author_id: true,
          name: true,
          short_biography: true,
          biography: true,
          nationality: true,
          date_of_birth: true,
          date_of_death: true,
          slug: true,
          created_at: true,
          updated_at: true
        }
      });
    });

    it('should return the found author', async () => {
      const author_slug = faker.lorem.slug();
      const foundAuthor = {
        author_id: faker.string.uuid(),
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        nationality: faker.location.country(),
        date_of_birth: faker.date.past(),
        date_of_death: faker.date.past(),
        slug: faker.lorem.slug(),
        updated_at: new Date()
      } as unknown as Awaited<ReturnType<typeof app.prisma.author.findUnique>>;

      vi.mocked(app.prisma.author.findUnique).mockResolvedValueOnce(foundAuthor);

      const result = await authorRepository.findAuthorBySlug(author_slug);

      expect(result).toEqual(foundAuthor);
    });

    it('should throw an error if prisma findUnique fails', async () => {
      const author_slug = faker.lorem.slug();

      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma findUnique failed', {
        code: 'P2025',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.author.findUnique).mockRejectedValueOnce(prismaError);

      await expect(authorRepository.findAuthorBySlug(author_slug)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError
      );
    });

    it('should return null if author is not found', async () => {
      const author_slug = faker.lorem.slug();

      vi.mocked(app.prisma.author.findUnique).mockResolvedValueOnce(null);

      const result = await authorRepository.findAuthorBySlug(author_slug);

      expect(result).toBeNull();
    });
  });

  describe('findAuthorById', () => {
    it("should call prisma's findUnique with correct author_id", async () => {
      const author_id = faker.string.uuid();

      await authorRepository.findAuthorById(author_id);

      expect(app.prisma.author.findUnique).toHaveBeenCalledWith({
        where: { author_id },
        select: {
          author_id: true,
          name: true,
          short_biography: true,
          biography: true,
          nationality: true,
          date_of_birth: true,
          date_of_death: true,
          slug: true,
          created_at: true,
          updated_at: true
        }
      });
    });

    it('should return the found author', async () => {
      const author_id = faker.string.uuid();
      const foundAuthor = {
        author_id,
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(2),
        nationality: faker.location.country(),
        date_of_birth: faker.date.past(),
        date_of_death: faker.date.past(),
        slug: faker.lorem.slug(),
        created_at: new Date(),
        updated_at: new Date()
      } as unknown as Awaited<ReturnType<typeof app.prisma.author.findUnique>>;

      vi.mocked(app.prisma.author.findUnique).mockResolvedValueOnce(foundAuthor);

      const result = await authorRepository.findAuthorById(author_id);

      expect(result).toEqual(foundAuthor);
    });

    it('should throw an error if prisma findUnique fails', async () => {
      const author_id = faker.string.uuid();

      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma findUnique failed', {
        code: 'P2025',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.author.findUnique).mockRejectedValueOnce(prismaError);

      await expect(authorRepository.findAuthorById(author_id)).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });

    it('should return null if author is not found', async () => {
      const author_id = faker.string.uuid();

      vi.mocked(app.prisma.author.findUnique).mockResolvedValueOnce(null);

      const result = await authorRepository.findAuthorById(author_id);

      expect(result).toBeNull();
    });
  });

  describe('findAllAuthors', () => {
    it("should call prisma's findMany and count with correct parameters", async () => {
      const page = 2;
      const pageSize = 5;

      await authorRepository.findAllAuthors(page, pageSize);

      expect(app.prisma.author.findMany).toHaveBeenCalledOnce();
      expect(app.prisma.author.findMany).toHaveBeenCalledWith({
        select: {
          name: true,
          short_biography: true,
          slug: true
        },
        skip: 5,
        take: 5,
        orderBy: {
          name: 'asc'
        }
      });
    });

    it("should call prisma's count method", async () => {
      const page = 1;
      const pageSize = 10;

      await authorRepository.findAllAuthors(page, pageSize);

      expect(app.prisma.author.count).toHaveBeenCalledOnce();
    });

    it("should call prisma's $transaction method", async () => {
      const page = 1;
      const pageSize = 10;

      await authorRepository.findAllAuthors(page, pageSize);

      expect(app.prisma.$transaction).toHaveBeenCalledOnce();
    });

    it('should return authors and total count', async () => {
      const page = 1;
      const pageSize = 10;
      const totalCount = 25;
      const authorsList = Array.from({ length: pageSize }, () => ({
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        slug: faker.lorem.slug()
      }));

      vi.mocked(app.prisma.$transaction).mockResolvedValueOnce([totalCount, authorsList]);

      const result = await authorRepository.findAllAuthors(page, pageSize);

      expect(result).toEqual([totalCount, authorsList]);
    });

    it('should throw an error if $transaction fails', async () => {
      const page = 1;
      const pageSize = 10;

      const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma transaction failed', {
        code: 'P1010',
        clientVersion: Prisma.prismaVersion.client
      });

      vi.mocked(app.prisma.$transaction).mockRejectedValueOnce(prismaError);

      await expect(authorRepository.findAllAuthors(page, pageSize)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError
      );
    });
  });

  describe('Singleton Behavior', () => {
    it('should return the same instance on multiple calls to getInstance', () => {
      const instance1 = AuthorRepository.getInstance(app);
      const instance2 = AuthorRepository.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });
});
