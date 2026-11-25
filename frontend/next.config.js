const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy all /api/* requests to the Express backend
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
    ];
  },

  // Allow Cloudinary images (adjust if you use another host)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

module.exports = nextConfig;
