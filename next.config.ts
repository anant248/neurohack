/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/facelandmarker',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;