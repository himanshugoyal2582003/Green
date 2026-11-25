const { cloudinary, isConfigured } = require('../config/cloudinary');

function requireCloudinary() {
  if (!isConfigured()) {
    const error = new Error('Cloudinary is not configured. Add CLOUDINARY_URL or the CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET values to backend/.env.');
    error.status = 503;
    throw error;
  }
}

function uploadImage(buffer, folder) {
  requireCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `green-marketplace/${folder}`, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id })
    );
    stream.end(buffer);
  });
}

async function destroyImages(images = []) {
  await Promise.allSettled(images.filter(image => image?.publicId).map(image => cloudinary.uploader.destroy(image.publicId, { resource_type: 'image' })));
}

module.exports = { uploadImage, destroyImages };
