const request = require('supertest');

jest.mock('../../src/occupancy/occupancy.service');

const occupancyService = require('../../src/occupancy/occupancy.service');
const app = require('../../configs/app');
const { signValidToken, signExpiredToken, signWrongIssuerToken } = require('../helpers/token');

describe('JWT protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    occupancyService.getSummary.mockResolvedValue({
      totalEvents: 0, totalCapacity: 0, totalRegistered: 0, totalAvailable: 0, events: [],
    });
  });

  it('rejects requests without a token', async () => {
    const response = await request(app).get('/summary');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('rejects requests with a malformed token', async () => {
    const response = await request(app).get('/summary').set('Authorization', 'Bearer not-a-jwt');
    expect(response.status).toBe(401);
  });

  it('rejects expired tokens', async () => {
    const token = signExpiredToken();
    const response = await request(app).get('/summary').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('rejects tokens with the wrong issuer', async () => {
    const token = signWrongIssuerToken();
    const response = await request(app).get('/summary').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('accepts a valid token signed with the shared secret', async () => {
    const token = signValidToken();
    const response = await request(app).get('/summary').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
