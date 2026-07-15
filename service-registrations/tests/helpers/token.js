const jwt = require('jsonwebtoken');

const signValidToken = (payload = {}) => jwt.sign(
  { userId: 'user-1', email: 'user@example.com', roles: ['attendee'], ...payload },
  process.env.JWT_SECRET,
  {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    algorithm: process.env.JWT_ALGORITHM,
    expiresIn: '1h',
  },
);

const signExpiredToken = (payload = {}) => jwt.sign(
  { userId: 'user-1', email: 'user@example.com', roles: ['attendee'], ...payload },
  process.env.JWT_SECRET,
  {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    algorithm: process.env.JWT_ALGORITHM,
    expiresIn: '-1h',
  },
);

const signWrongIssuerToken = (payload = {}) => jwt.sign(
  { userId: 'user-1', email: 'user@example.com', roles: ['attendee'], ...payload },
  process.env.JWT_SECRET,
  {
    issuer: 'someone-else',
    audience: process.env.JWT_AUDIENCE,
    algorithm: process.env.JWT_ALGORITHM,
    expiresIn: '1h',
  },
);

module.exports = { signValidToken, signExpiredToken, signWrongIssuerToken };
