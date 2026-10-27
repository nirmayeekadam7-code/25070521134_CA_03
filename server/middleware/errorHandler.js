// 404 for unknown routes
const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Central error handler: turns Mongoose errors into friendly messages
const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Resource not found.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
};

module.exports = { notFound, errorHandler };
