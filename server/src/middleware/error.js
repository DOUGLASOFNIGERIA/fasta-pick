const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found on FastaPick.`,
  });
};

const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode || err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Something went wrong on our end.';

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already in use.`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'That ID is not valid.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { asyncHandler, notFound, errorHandler };
