import { isAdminOrLibrarianHook } from '@/hooks/auth.js';
import { addRouteTags } from '@/hooks/onRoute.js';

export default function staffHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff'));

  fastify.addHook('preHandler', isAdminOrLibrarianHook(fastify));
}
