import { UserModel } from '@modules/user/user.model';
import { UserService } from '@modules/user/user.service';
import { Role } from '@prisma/client';
import { fastify } from 'fastify';

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
});
