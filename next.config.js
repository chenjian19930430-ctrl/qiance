/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['bcryptjs'],
  outputFileTracingRoot: process.cwd(),
}

module.exports = nextConfig
