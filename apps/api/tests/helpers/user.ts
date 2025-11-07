import { faker } from '@faker-js/faker';
import { signUpSchema } from '@modules/auth/auth.schema';
import { Static } from 'typebox';
import { Role } from '@prisma/client';

type signupResponseData = Static<(typeof signUpSchema)['response']['201']>;

/**
 * Create a new user via the signup endpoint.
 * @param app The Fastify app instance
 * @param name The name of the user
 * @param password The password of the user (default: Password123!)
 * @param role The role of user (default: MEMBER)
 * @returns User signup response data
 */
export async function createUser(
  app: FastifyTypeBox,
  name: string,
  password = 'Password123!',
  role = Role.MEMBER
): Promise<signupResponseData> {
  // Sign up a new user
  const signupResponse = await app.inject({
    method: 'POST',
    path: '/auth/signup',
    body: {
      email: faker.internet.email({
        firstName: name
      }),
      password: password,
      name
    }
  });

  if (signupResponse.statusCode !== 201) {
    throw new Error(`Failed to sign up user: ${signupResponse.body}`);
  }

  const signupData = signupResponse.json() as signupResponseData;

  // Manually update the user's role if needed
  if (role !== Role.MEMBER) {
    await app.prisma.user.update({
      where: { user_id: signupData.user_id },
      data: { role }
    });
  }

  return signupData;
}
