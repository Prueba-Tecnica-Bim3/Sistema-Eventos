jest.mock('../../src/registrations/registrations.model');
jest.mock('../../src/clients/events.client');
jest.mock('../../src/occupancy/occupancy.service');

const Registration = require('../../src/registrations/registrations.model');
const eventsClient = require('../../src/clients/events.client');
const occupancyService = require('../../src/occupancy/occupancy.service');
const registrationsService = require('../../src/registrations/registrations.service');

describe('registrations.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerAttendee', () => {
    const baseInput = {
      eventId: 'event-1',
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
      registeredBy: 'user-1',
      token: 'valid-token',
    };

    it('registers an attendee when there is capacity and no duplicate', async () => {
      eventsClient.getEventById.mockResolvedValue({ id: 'event-1', name: 'Conf', capacity: 10 });
      occupancyService.countConfirmedByEvent.mockResolvedValue(3);
      occupancyService.calculateOccupancy
        .mockReturnValueOnce({ capacity: 10, registered: 3, available: 7, percentage: 30, isFull: false })
        .mockReturnValueOnce({ capacity: 10, registered: 4, available: 6, percentage: 40, isFull: false });
      Registration.findOne.mockResolvedValue(null);
      Registration.create.mockResolvedValue({ id: 'reg-1', ...baseInput });

      const result = await registrationsService.registerAttendee(baseInput);

      expect(Registration.create).toHaveBeenCalledWith(expect.objectContaining({
        eventId: 'event-1',
        attendeeEmail: 'jane@example.com',
        status: 'confirmed',
      }));
      expect(result.occupancy.available).toBe(6);
    });

    it('throws 404 when the event does not exist', async () => {
      const notFoundError = Object.assign(new Error('Not Found'), {
        isAxiosError: true,
        response: { status: 404 },
      });
      eventsClient.getEventById.mockRejectedValue(notFoundError);

      await expect(registrationsService.registerAttendee(baseInput)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('propagates errors when Service Events is unreachable', async () => {
      const networkError = Object.assign(new Error('connect ECONNREFUSED'), {
        isAxiosError: true,
        response: undefined,
      });
      eventsClient.getEventById.mockRejectedValue(networkError);

      await expect(registrationsService.registerAttendee(baseInput)).rejects.toMatchObject({
        isAxiosError: true,
      });
    });

    it('throws 409 when the event is full', async () => {
      eventsClient.getEventById.mockResolvedValue({ id: 'event-1', name: 'Conf', capacity: 5 });
      occupancyService.countConfirmedByEvent.mockResolvedValue(5);
      occupancyService.calculateOccupancy.mockReturnValue({
        capacity: 5, registered: 5, available: 0, percentage: 100, isFull: true,
      });

      await expect(registrationsService.registerAttendee(baseInput)).rejects.toMatchObject({
        statusCode: 409,
      });
      expect(Registration.create).not.toHaveBeenCalled();
    });

    it('throws 409 when the attendee is already registered', async () => {
      eventsClient.getEventById.mockResolvedValue({ id: 'event-1', name: 'Conf', capacity: 10 });
      occupancyService.countConfirmedByEvent.mockResolvedValue(1);
      occupancyService.calculateOccupancy.mockReturnValue({
        capacity: 10, registered: 1, available: 9, percentage: 10, isFull: false,
      });
      Registration.findOne.mockResolvedValue({ id: 'existing-reg' });

      await expect(registrationsService.registerAttendee(baseInput)).rejects.toMatchObject({
        statusCode: 409,
      });
      expect(Registration.create).not.toHaveBeenCalled();
    });
  });

  describe('cancelRegistration', () => {
    it('cancels an existing confirmed registration', async () => {
      const save = jest.fn().mockResolvedValue(true);
      Registration.findById.mockResolvedValue({ status: 'confirmed', save });

      const registration = await registrationsService.cancelRegistration('reg-1');

      expect(registration.status).toBe('cancelled');
      expect(registration.cancelledAt).toBeInstanceOf(Date);
      expect(save).toHaveBeenCalled();
    });

    it('throws 404 when the registration does not exist', async () => {
      Registration.findById.mockResolvedValue(null);

      await expect(registrationsService.cancelRegistration('missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('throws 409 when the registration is already cancelled', async () => {
      Registration.findById.mockResolvedValue({ status: 'cancelled' });

      await expect(registrationsService.cancelRegistration('reg-1')).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe('getAttendeesByEvent', () => {
    it('filters by confirmed status by default', async () => {
      const sort = jest.fn().mockResolvedValue([{ attendeeName: 'Jane' }]);
      Registration.find.mockReturnValue({ sort });

      const attendees = await registrationsService.getAttendeesByEvent('event-1');

      expect(Registration.find).toHaveBeenCalledWith({ eventId: 'event-1', status: 'confirmed' });
      expect(attendees).toHaveLength(1);
    });

    it('does not filter by status when "all" is requested', async () => {
      const sort = jest.fn().mockResolvedValue([]);
      Registration.find.mockReturnValue({ sort });

      await registrationsService.getAttendeesByEvent('event-1', 'all');

      expect(Registration.find).toHaveBeenCalledWith({ eventId: 'event-1' });
    });
  });
});
