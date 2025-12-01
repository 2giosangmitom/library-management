import StaffLocationService from '@/modules/staff/location/services';
import { Prisma } from '@/generated/prisma/client';
import { buildMockFastify } from '../../../helpers/mockFastify';

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

  describe('deleteLocation', () => {
    it('should call prisma.location.delete with correct location_id', async () => {
      const locationId = 'A-1-2-3';

      await staffLocationService.deleteLocation(locationId);

      expect(app.prisma.location.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            location_id: locationId
          }
        })
      );
    });

    it('should return the deleted location', async () => {
      const locationId = 'A-1-2-3';
      const deletedLocation = {
        location_id: locationId,
        room: 'A',
        floor: 1,
        shelf: 2,
        row: 3
      } as unknown as Awaited<ReturnType<typeof app.prisma.location.delete>>;

      vi.mocked(app.prisma.location.delete).mockResolvedValueOnce(deletedLocation);

      const result = await staffLocationService.deleteLocation(locationId);

      expect(result).toEqual(deletedLocation);
    });

    it("should throw 404 error if location doesn't exist", async () => {
      const locationId = 'NON-EXISTING';

      vi.mocked(app.prisma.location.delete).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(staffLocationService.deleteLocation(locationId)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Location with the given ID does not exist.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const locationId = 'A-1-2-3';

      vi.mocked(app.prisma.location.delete).mockRejectedValueOnce(new Error('Some other error'));

      await expect(staffLocationService.deleteLocation(locationId)).rejects.toThrowError('Some other error');
    });
  });
});
