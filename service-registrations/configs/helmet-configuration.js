const helmet = require('helmet');

const helmetConfiguration = helmet({
  contentSecurityPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
});

module.exports = helmetConfiguration;
