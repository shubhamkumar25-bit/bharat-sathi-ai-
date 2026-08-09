import systemLogsService from '../services/systemLogsService.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error.';

  // Log the API error
  const metadata = {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    uid: req.user ? req.user.uid : null,
  };
  
  systemLogsService.apiError('express-api', message, error.stack || '', metadata)
    .catch(err => console.error('Failed to write system log:', err));

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  });
}