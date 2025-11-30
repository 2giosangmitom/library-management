import { addRouteTags } from '@hooks/onRoute';

export default function loanHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Loan'));
}
