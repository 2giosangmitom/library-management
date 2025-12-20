import StaffLoanController from './controllers';
import { CreateLoanSchema, UpdateLoanSchema, DeleteLoanSchema } from './schemas';

export default function staffLoanRoutes(fastify: FastifyTypeBox) {
  const controller = fastify.diContainer.resolve<StaffLoanController>('staffLoanController');

  fastify.post('/', { schema: CreateLoanSchema }, controller.createLoan.bind(controller));
  fastify.patch('/:loan_id', { schema: UpdateLoanSchema }, controller.updateLoan.bind(controller));
  fastify.delete('/:loan_id', { schema: DeleteLoanSchema }, controller.deleteLoan.bind(controller));
}
