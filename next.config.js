/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['bcryptjs'],
  outputFileTracingRoot: process.cwd(),
}

module.exports = nextConfig
