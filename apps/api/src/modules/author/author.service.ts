import { AuthorModel } from './author.model';

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
  public createAuthor(data: { name: string; biography: string; nationality: string; slug: string }) {
    return this.authorModel.createAuthor(data);
  }
}
