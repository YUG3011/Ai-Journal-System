function errorHandler(err, req, res, next) {
  // Avoid logging full request bodies to protect sensitive text
  const status = err.status || 500;
  const isValidation = status === 400 && Array.isArray(err.details);

  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err.message, err.details ? JSON.stringify(err.details) : '');
  }

  if (isValidation) {
    return res.status(400).json({ error: 'Invalid request', details: err.details });
  }

  // Handle known upstream/LLM/db errors with a friendly structure
  const message = err.message || 'Internal server error';
  return res.status(status).json({ error: 'Request failed', message });
}

module.exports = errorHandler;
