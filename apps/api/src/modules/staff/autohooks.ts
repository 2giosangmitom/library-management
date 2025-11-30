import { isAdminOrLibrarianHook } from '@hooks/auth';
import { addRouteTags } from '@hooks/onRoute';

export default function staffHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff'));

  fastify.addHook('preHandler', isAdminOrLibrarianHook(fastify));
}
