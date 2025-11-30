import { authHook, isAdminHook } from '@/hooks/auth.js';
import { addRouteTags } from '@/hooks/onRoute.js';

export default function adminHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Admin'));
  fastify.addHook('preHandler', authHook);
  fastify.addHook('preHandler', isAdminHook);
}
