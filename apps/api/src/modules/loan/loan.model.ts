export class LoanModel {
  private fastify: FastifyTypeBox | null = null;
  private static instance: LoanModel | null = null;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): LoanModel {
    if (!LoanModel.instance) {
      LoanModel.instance = new LoanModel(fastify);
    }
    return LoanModel.instance;
  }
}
