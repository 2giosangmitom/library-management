import StaffLoanController from './controllers';
import { CreateLoanSchema } from './schemas';

export default function staffLoanRoutes(fastify: FastifyTypeBox) {
  const controller = fastify.diContainer.resolve<StaffLoanController>('staffLoanController');

  fastify.post('/', { schema: CreateLoanSchema }, controller.createLoan.bind(controller));
}
