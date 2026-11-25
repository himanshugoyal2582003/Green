function notFound(_req, res) { res.status(404).json({ error: 'Route not found.' }); }
function errorHandler(error, _req, res, _next) {
  if (error.name === 'MulterError') return res.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5 MB or smaller.' : error.message });
  if (error.message === 'Use a JPG, PNG, WebP, or AVIF image.') return res.status(400).json({ error: error.message });
  if (error.status) return res.status(error.status).json({ error: error.message });
  if (error.code === 11000) return res.status(409).json({ error: 'That email address is already registered.' });
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ error: error.message });
  console.error(error);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
module.exports = { notFound, errorHandler };
