/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Previews are already resized WebP from our own pipeline (sharp on
    // Railway), stored in GCS me-central1 next to our users. Routing them
    // through Vercel's optimizer (US) added ~4s per image and never cached,
    // because every signed URL is unique. Serve them directly instead.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
};

module.exports = nextConfig;
