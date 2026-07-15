function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: 'Not Found',
    error: 'NOT_FOUND',
  });
}

module.exports = { notFoundHandler };
