import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Update image configuration to use remotePatterns instead of domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
    ],
  },
  // Rewrites to proxy API requests to the backend services
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8081/api/auth/:path*', // Auth service
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:8082/api/:path*', // Movie catalog service
      },
    ];
  },
};

export default nextConfig;
