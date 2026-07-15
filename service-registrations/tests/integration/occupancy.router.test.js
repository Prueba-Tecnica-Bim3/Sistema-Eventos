const request = require('supertest');

jest.mock('../../src/occupancy/occupancy.service');

const occupancyService = require('../../src/occupancy/occupancy.service');
const app = require('../../configs/app');
const { signValidToken } = require('../helpers/token');

describe('occupancy router', () => {
  const token = signValidToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /events/available returns events with available capacity', async () => {
    occupancyService.getAvailableEvents.mockResolvedValue([
      {
        eventId: 'e1', name: 'Evento 1', capacity: 10, registered: 4, available: 6, percentage: 40, isFull: false,
      },
    ]);

    const response = await request(app).get('/events/available').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.count).toBe(1);
  });

  it('GET /events/full returns events at capacity', async () => {
    occupancyService.getFullEvents.mockResolvedValue([
      {
        eventId: 'e2', name: 'Evento 2', capacity: 2, registered: 2, available: 0, percentage: 100, isFull: true,
      },
    ]);

    const response = await request(app).get('/events/full').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.events[0].isFull).toBe(true);
  });

  it('GET /summary returns an aggregated occupancy summary', async () => {
    occupancyService.getSummary.mockResolvedValue({
      totalEvents: 2,
      fullEvents: 1,
      availableEvents: 1,
      totalCapacity: 12,
      totalRegistered: 5,
      totalAvailable: 7,
      overallPercentage: 42,
      events: [],
    });

    const response = await request(app).get('/summary').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.totalEvents).toBe(2);
  });

  it('requires a valid token for every occupancy endpoint', async () => {
    const responses = await Promise.all([
      request(app).get('/events/available'),
      request(app).get('/events/full'),
      request(app).get('/summary'),
    ]);

    responses.forEach((response) => expect(response.status).toBe(401));
  });
});
