import StaffLocationService from '@modules/staff/location/services';
import { Prisma } from '@src/generated/prisma/client';
import { buildMockFastify } from '@tests/unit/helpers/mockFastify';

describe('StaffLocationService', async () => {
  const app = await buildMockFastify();
  const staffLocationService = StaffLocationService.getInstance(app);

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = StaffLocationService.getInstance(app);
      const instance2 = StaffLocationService.getInstance(app);
      expect(instance1).toBe(instance2);
    });
  });

  describe('addLocation', () => {
    it.each([
      { room: 'B', floor: 1, shelf: 2, row: 3, expected: 'B-1-2-3' },
      { room: 'C', floor: 0, shelf: 0, row: 0, expected: 'C-0-0-0' },
      { room: 'D', floor: 5, shelf: 10, row: 15, expected: 'D-5-10-15' }
    ])(
      'calculate location id correctly for { room: $room, floor: $floor, shelf: $shelf, row: $row }',
      async ({ room, floor, shelf, row, expected }) => {
        await staffLocationService.addLocation({
          room,
          floor,
          shelf,
          row
        });

        expect(app.prisma.location.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              location_id: expected,
              room,
              floor,
              shelf,
              row
            }
          })
        );
      }
    );

    it('should throw conflict error when location with same ID exists', async () => {
      vi.mocked(app.prisma.location.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Error creating location', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(
        staffLocationService.addLocation({
          room: 'A',
          floor: 1,
          shelf: 2,
          row: 3
        })
      ).rejects.toThrowError('Location with the same ID already exists.');
    });

    it('should rethrow unknown errors', async () => {
      vi.mocked(app.prisma.location.create).mockRejectedValueOnce(new Error('Unknown error'));

      await expect(
        staffLocationService.addLocation({
          room: 'A',
          floor: 1,
          shelf: 2,
          row: 3
        })
      ).rejects.toThrowError('Unknown error');
    });
  });
});
