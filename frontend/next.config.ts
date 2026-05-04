import type { NextConfig } from 'next';

/** NestJS URL when browser calls same-origin `/api/*` (see `lib/api.ts`). */
const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:3000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
