import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // API 우회 프록시: 페이지 경로와 충돌 방지용
      {
        source: '/api/admin/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://backend.klk1.store/admin/:path*'
          : 'http://localhost:3000/admin/:path*',
      },
      {
        source: '/admin/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://backend.klk1.store/admin/:path*'
          : 'http://localhost:3000/admin/:path*',
      },
    ]
  },
};

export default nextConfig;
