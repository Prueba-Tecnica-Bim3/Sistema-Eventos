const request = require('supertest');

jest.mock('../../src/registrations/registrations.service');

const registrationsService = require('../../src/registrations/registrations.service');
const app = require('../../configs/app');
const { signValidToken } = require('../helpers/token');

describe('registrations router', () => {
  const token = signValidToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /registrations', () => {
    const validBody = {
      eventId: 'event-1',
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    };

    it('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/registrations')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(registrationsService.registerAttendee).not.toHaveBeenCalled();
    });

    it('returns 400 when the email is invalid', async () => {
      const response = await request(app)
        .post('/registrations')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validBody, attendeeEmail: 'not-an-email' });

      expect(response.status).toBe(400);
    });

    it('registers an attendee and returns 201 on success', async () => {
      registrationsService.registerAttendee.mockResolvedValue({
        registration: { id: 'reg-1', ...validBody, status: 'confirmed' },
        occupancy: {
          eventId: 'event-1', name: 'Conf', capacity: 10, registered: 4, available: 6, percentage: 40, isFull: false,
        },
      });

      const response = await request(app)
        .post('/registrations')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.occupancy.available).toBe(6);
    });

    it('maps a duplicate registration error to 409', async () => {
      registrationsService.registerAttendee.mockRejectedValue(
        Object.assign(new Error('El asistente ya se encuentra inscrito en este evento'), { statusCode: 409 }),
      );

      const response = await request(app)
        .post('/registrations')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('maps an unknown event error to 404', async () => {
      registrationsService.registerAttendee.mockRejectedValue(
        Object.assign(new Error('El evento solicitado no existe'), { statusCode: 404 }),
      );

      const response = await request(app)
        .post('/registrations')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody);

      expect(response.status).toBe(404);
    });

    it('returns 401 without a valid token', async () => {
      const response = await request(app).post('/registrations').send(validBody);
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /registrations/:id', () => {
    it('returns 400 for a non mongo-id', async () => {
      const response = await request(app)
        .delete('/registrations/not-a-valid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it('cancels a registration successfully', async () => {
      registrationsService.cancelRegistration.mockResolvedValue({
        id: '507f1f77bcf86cd799439011', status: 'cancelled',
      });

      const response = await request(app)
        .delete('/registrations/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.registration.status).toBe('cancelled');
    });

    it('returns 404 when the registration does not exist', async () => {
      registrationsService.cancelRegistration.mockRejectedValue(
        Object.assign(new Error('Inscripcion no encontrada'), { statusCode: 404 }),
      );

      const response = await request(app)
        .delete('/registrations/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /events/:id/attendees', () => {
    it('lists attendees for an event', async () => {
      registrationsService.getAttendeesByEvent.mockResolvedValue([
        { attendeeName: 'Jane Doe', attendeeEmail: 'jane@example.com', status: 'confirmed' },
      ]);

      const response = await request(app)
        .get('/events/event-1/attendees')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(1);
    });

    it('rejects an invalid status filter', async () => {
      const response = await request(app)
        .get('/events/event-1/attendees?status=unknown')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });
});
