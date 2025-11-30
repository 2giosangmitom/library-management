import { addRouteTags } from '@/hooks/onRoute.js';

export default function publisherHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Publisher'));
}
