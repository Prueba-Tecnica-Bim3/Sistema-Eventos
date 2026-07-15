/**
 * Helper to wrap async route handlers and forward errors to Express error handler.
 */
function catchAsync(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { catchAsync };
