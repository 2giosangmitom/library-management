import { addRouteTags } from '@/hooks/onRoute.js';

export default function authHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Auth'));
}
