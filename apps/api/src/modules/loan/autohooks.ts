import { addRouteTags } from '@/hooks/onRoute.js';

export default function loanHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Loan'));
}
