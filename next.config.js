/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => null,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pics.avs.io',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
