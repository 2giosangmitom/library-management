import { UserModel } from '@modules/user/user.model';
import { UserService } from '@modules/user/user.service';
import { Role } from '@prisma/client';
import { fastify } from 'fastify';
import { Prisma } from '@prisma/client';

describe('user service', () => {
  const app = fastify();
  const userModel = UserModel.getInstance(app);
  const userService = UserService.getInstance(app, userModel);

  afterAll(async () => {
    await app.close();
  });

  describe('get user info', () => {
    beforeEach(() => {
      userModel.findUserById = vi.fn();
    });

    it('should return user data if found', async () => {
      const user = {
        user_id: 'user-uuid',
        email: 'user@test.com',
        name: 'Test User',
        role: Role.MEMBER,
        password_hash: 'hashedpassword',
        salt: 'randomsalt'
      };

      vi.spyOn(userModel, 'findUserById').mockResolvedValueOnce(user);

      await expect(userService.getUserInfo('user-uuid')).resolves.toEqual(user);
    });

    it('should call findUserById with correct id', async () => {
      const id = 'user-uuid-2';
      await userService.getUserInfo(id);

      expect(userModel.findUserById).toHaveBeenCalledWith(id);
    });

    it('should return null if user not found', async () => {
      vi.spyOn(userModel, 'findUserById').mockResolvedValueOnce(null);

      await expect(userService.getUserInfo('non-existent-id')).resolves.toBeNull();
    });
  });

  describe('update user', () => {
    beforeEach(() => {
      userModel.updateUser = vi.fn();
    });

    it('should return updated user when successful', async () => {
      const updated = {
        user_id: 'user-uuid',
        email: 'user@test.com',
        name: 'New Name',
        role: Role.MEMBER,
        updated_at: new Date()
      };

      vi.spyOn(userModel, 'updateUser').mockResolvedValueOnce(updated);

      const result = await userService.updateUser('user-uuid', { name: 'New Name' });

      expect(userModel.updateUser).toHaveBeenCalledWith('user-uuid', { name: 'New Name' });
      expect(result).toEqual(updated);
    });

    it('should return null if user not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '6.0.0'
      });
      vi.spyOn(userModel, 'updateUser').mockRejectedValueOnce(prismaError);

      const result = await userService.updateUser('non-existent-id', { name: 'X' });
      expect(result).toBeNull();
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Boom');
      vi.spyOn(userModel, 'updateUser').mockRejectedValueOnce(error);

      await expect(userService.updateUser('id', { name: 'X' })).rejects.toThrow('Boom');
    });
  });
});
