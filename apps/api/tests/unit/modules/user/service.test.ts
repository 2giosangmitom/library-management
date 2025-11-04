import { UserModel } from '@modules/user/user.model';
import { UserService } from '@modules/user/user.service';
import { Role } from '@prisma/client';
import { fastify } from 'fastify';
import * as hashUtils from '@utils/hash';
import { Prisma } from '@prisma/client';
import { FastifyRedis } from '@fastify/redis';
import { RedisTokenUtils } from '@utils/redis';

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

  describe('update email', () => {
    beforeEach(() => {
      userModel.updateUserEmail = vi.fn();
    });

    it('should return updated user when successful', async () => {
      const updated = {
        user_id: 'user-uuid',
        email: 'new@test.com',
        name: 'Name',
        role: Role.MEMBER,
        updated_at: new Date()
      };

      vi.spyOn(userModel, 'updateUserEmail').mockResolvedValueOnce(updated);

      const result = await userService.updateEmail('user-uuid', 'new@test.com');

      expect(userModel.updateUserEmail).toHaveBeenCalledWith('user-uuid', 'new@test.com');
      expect(result).toEqual(updated);
    });

    it('should return null if user not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '6.0.0'
      });
      vi.spyOn(userModel, 'updateUserEmail').mockRejectedValueOnce(prismaError);

      const result = await userService.updateEmail('non-existent-id', 'x@test.com');
      expect(result).toBeNull();
    });

    it('should rethrow unique constraint errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: '6.0.0'
      });
      vi.spyOn(userModel, 'updateUserEmail').mockRejectedValueOnce(prismaError);

      await expect(userService.updateEmail('user-uuid', 'exists@test.com')).rejects.toThrow(prismaError);
    });
  });

  describe('change password', () => {
    let redisTokenUtils: RedisTokenUtils;

    beforeEach(() => {
      userModel.findUserById = vi.fn();
      userModel.updateUserPassword = vi.fn();
      const redisClient = {} as FastifyRedis;
      redisTokenUtils = RedisTokenUtils.getInstance(redisClient);
      redisTokenUtils.revokeAllJWTs = vi.fn();
    });

    it('should change password when current password is valid', async () => {
      const user = {
        user_id: 'user-uuid',
        password_hash: 'old-hash',
        salt: 'old-salt',
        name: 'Name',
        email: 'old@test.com',
        role: Role.MEMBER
      };

      vi.spyOn(userModel, 'findUserById').mockResolvedValueOnce(user);

      vi.spyOn(hashUtils, 'verifyHash').mockResolvedValueOnce(true);
      vi.spyOn(hashUtils, 'generateHash').mockResolvedValueOnce({ hash: 'new-hash', salt: 'new-salt' });

      await expect(userService.changePassword('user-uuid', 'current', 'newpass', 'current-jwt')).resolves.toBe(true);

      expect(userModel.updateUserPassword).toHaveBeenCalledWith('user-uuid', 'new-hash', 'new-salt');
    });

    it('should return false when current password is invalid', async () => {
      const user = {
        user_id: 'user-uuid',
        password_hash: 'old-hash',
        salt: 'old-salt',
        name: 'Name',
        email: 'old@test.com',
        role: Role.MEMBER
      };

      vi.spyOn(userModel, 'findUserById').mockResolvedValueOnce(user);

      vi.spyOn(hashUtils, 'verifyHash').mockResolvedValueOnce(false);

      await expect(userService.changePassword('user-uuid', 'wrong', 'newpass', 'current-jwt')).resolves.toBe(false);

      expect(userModel.updateUserPassword).not.toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      vi.spyOn(userModel, 'findUserById').mockResolvedValueOnce(null);

      await expect(userService.changePassword('not-found', 'x', 'y', 'current-jwt')).resolves.toBeNull();
    });

    it('should sign out other sessions after password change', async () => {
      const user = {
        user_id: 'user-uuid',
        password_hash: 'old-hash',
        salt: 'old-salt',
        name: 'Name',
        email: 'old@test.com',
        role: Role.MEMBER
      };

      vi.spyOn(userModel, 'findUserById').mockResolvedValueOnce(user);
      vi.spyOn(hashUtils, 'verifyHash').mockResolvedValueOnce(true);
      vi.spyOn(hashUtils, 'generateHash').mockResolvedValueOnce({ hash: 'new-hash', salt: 'new-salt' });
      userModel.updateUserPassword = vi.fn();

      await expect(userService.changePassword('user-uuid', 'current', 'newpass', 'current-jwt')).resolves.toBe(true);

      expect(redisTokenUtils.revokeAllJWTs).toHaveBeenCalledWith('user-uuid', 'current-jwt');
    });
  });
});
