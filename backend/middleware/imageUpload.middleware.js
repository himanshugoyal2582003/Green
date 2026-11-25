const multer = require('multer');

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const storage = multer.memoryStorage();

function fileFilter(_req, file, callback) {
  if (!allowedTypes.has(file.mimetype)) return callback(new Error('Use a JPG, PNG, WebP, or AVIF image.'));
  return callback(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 6 } });
module.exports = upload;
