import StaffLoanController from './controllers';
import { CreateLoanSchema, UpdateLoanSchema } from './schemas';

export default function staffLoanRoutes(fastify: FastifyTypeBox) {
  const controller = fastify.diContainer.resolve<StaffLoanController>('staffLoanController');

  fastify.post('/', { schema: CreateLoanSchema }, controller.createLoan.bind(controller));
  fastify.patch('/:loan_id', { schema: UpdateLoanSchema }, controller.updateLoan.bind(controller));
}
