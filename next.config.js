/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Signed GCS URLs come from a single bucket host, but the path/query
    // changes per request/expiry — remotePatterns needs the hostname only.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
};

module.exports = nextConfig;
