import StaffLoanController from './controllers';
import { CreateLoanSchema } from './schemas';

export default function staffLoanRoutes(fastify: FastifyTypeBox) {
  const controller = StaffLoanController.getInstance(fastify);

  fastify.post('/', { schema: CreateLoanSchema }, controller.createLoan.bind(controller));
}
