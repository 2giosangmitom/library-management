import { addRouteTags } from '@/hooks/onRoute';

export default function userHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('User'));
}
