const request = require('supertest');
const app = require('../../configs/app');

describe('GET /health', () => {
  it('returns success without requiring a token', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      service: 'service-registrations',
      status: 'ok',
    });
  });
});
