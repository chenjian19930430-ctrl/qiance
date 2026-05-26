/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'qiance.ai', 'api.qiance.ai'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
