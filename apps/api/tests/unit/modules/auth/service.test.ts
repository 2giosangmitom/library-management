import { AuthModel } from '@modules/auth/auth.model';
import { AuthService } from '@modules/auth/auth.service';
import { fastify } from 'fastify';
import * as hashUtils from '@utils/hash';

describe('auth service', () => {
  const app = fastify();
  const authModel = AuthModel.getInstance(app);
  const authService = AuthService.getInstance(app, authModel);

  describe('sign up', () => {
    beforeEach(() => {
      authModel.createUser = vi.fn();
    });

    it('should return user data if sign up is successful', async () => {
      vi.spyOn(authModel, 'createUser').mockResolvedValueOnce({
        user_id: 'some-uuid',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date()
      });

      await expect(
        authService.signUp({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      ).resolves.toEqual({
        user_id: 'some-uuid',
        email: 'test@example.com',
        name: 'Test User',
        created_at: expect.any(Date)
      });
    });

    it('should hash the password before creating user', async () => {
      const hashSpy = vi.spyOn(hashUtils, 'generateHash').mockResolvedValueOnce({
        hash: 'hashedPassword',
        salt: 'randomSalt'
      });

      const password = 'password123';

      await authService.signUp({
        email: 'test@example.com',
        password,
        name: 'Test User'
      });

      expect(hashSpy).toHaveBeenCalledOnce();
      expect(hashSpy).toHaveBeenCalledWith(password);
      expect(authModel.createUser).toHaveBeenCalledOnce();
      expect(authModel.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        name: 'Test User',
        salt: 'randomSalt'
      });
    });

    it('should throw error if createUser fails', async () => {
      vi.spyOn(authModel, 'createUser').mockRejectedValueOnce(new Error('Database error'));

      await expect(
        authService.signUp({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      ).rejects.toThrow('Database error');
    });
  });
});
