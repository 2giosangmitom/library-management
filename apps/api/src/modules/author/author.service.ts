import { Prisma } from '@src/generated/prisma/client';

export default class AuthorService {
  private static instance: AuthorService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): AuthorService {
    if (!AuthorService.instance) {
      AuthorService.instance = new AuthorService(fastify);
    }
    return AuthorService.instance;
  }

  public async createAuthor(data: {
    name: string;
    short_biography: string;
    biography: string;
    date_of_birth: string | null;
    date_of_death: string | null;
    nationality: string | null;
    slug: string;
  }) {
    try {
      const createdAuthor = await this.fastify.prisma.author.create({
        data: {
          ...data
        }
      });

      return createdAuthor;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw this.fastify.httpErrors.conflict('Author with the given slug already exists.');
        }
      }
      throw error;
    }
  }

  public async deleteAuthor(author_id: string) {
    try {
      const deletedAuthor = await this.fastify.prisma.author.delete({
        select: { author_id: true, name: true },
        where: { author_id }
      });

      return deletedAuthor;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw this.fastify.httpErrors.notFound('Author with the given ID does not exist.');
        }
      }
      throw error;
    }
  }
}
