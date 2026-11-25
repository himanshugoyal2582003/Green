const cloudinary = require('cloudinary').v2;

if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function isConfigured() {
  const config = cloudinary.config();
  return Boolean(config.cloud_name && config.api_key && config.api_secret);
}

module.exports = { cloudinary, isConfigured };
