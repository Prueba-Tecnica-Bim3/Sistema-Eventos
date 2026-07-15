const express = require('express');
const request = require('supertest');
const handleErrors = require('../../middlewares/handle-errors');

const buildAppThatThrows = (error) => {
  const app = express();
  app.get('/boom', (req, res, next) => next(error));
  app.use(handleErrors);
  return app;
};

describe('handle-errors middleware', () => {
  it('maps an unreachable Service Events (no response) to 503', async () => {
    const error = Object.assign(new Error('connect ECONNREFUSED'), { isAxiosError: true });
    const response = await request(buildAppThatThrows(error)).get('/boom');

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
  });

  it('maps a Service Events error response to the same status code', async () => {
    const error = Object.assign(new Error('boom'), {
      isAxiosError: true,
      response: { status: 404, statusText: 'Not Found', data: {} },
    });
    const response = await request(buildAppThatThrows(error)).get('/boom');

    expect(response.status).toBe(404);
  });

  it('maps a Mongoose CastError to 400', async () => {
    const error = Object.assign(new Error('Cast to ObjectId failed'), { name: 'CastError', path: 'eventId' });
    const response = await request(buildAppThatThrows(error)).get('/boom');

    expect(response.status).toBe(400);
  });

  it('maps a Mongo duplicate key error to 409', async () => {
    const error = Object.assign(new Error('duplicate'), { code: 11000 });
    const response = await request(buildAppThatThrows(error)).get('/boom');

    expect(response.status).toBe(409);
  });

  it('hides internal details for unexpected errors', async () => {
    const error = new Error('something with a secret stack trace');
    const response = await request(buildAppThatThrows(error)).get('/boom');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error interno del servidor');
    expect(JSON.stringify(response.body)).not.toContain('secret stack trace');
  });
});
