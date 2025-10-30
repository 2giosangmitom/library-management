import { AuthorModel } from './author.model';
import { Prisma } from '@prisma/client';

export class AuthorService {
  private static instance: AuthorService;
  private authorModel: AuthorModel;

  private constructor(authorModel: AuthorModel) {
    this.authorModel = authorModel;
  }

  public static getInstance(fastify: FastifyTypeBox, authorModel = AuthorModel.getInstance(fastify)): AuthorService {
    if (!AuthorService.instance) {
      AuthorService.instance = new AuthorService(authorModel);
    }
    return AuthorService.instance;
  }

  /**
   * Service method to create a new author
   * @param data Author data
   */
  public createAuthor(data: {
    name: string;
    short_biography: string;
    biography: string;
    nationality: string;
    slug: string;
  }) {
    return this.authorModel.createAuthor(data);
  }

  /**
   * Service method to get all authors
   */
  public getAllAuthors(page = 1, limit = 10) {
    return this.authorModel.getAllAuthors(page, limit);
  }

  /**
   * Service method to get author details
   * @param author_slug Author slug
   */
  public getAuthorDetails(author_slug: string) {
    return this.authorModel.getAuthorBySlug(author_slug);
  }

  /**
   * Service method to delete an author
   * @param author_id Author ID
   */
  public async deleteAuthor(author_id: string) {
    try {
      await this.authorModel.deleteAuthor(author_id);
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
