import { addRouteTags } from '@/hooks/onRoute.js';

export default function userHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('User'));
}
