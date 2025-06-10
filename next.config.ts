import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/chat-completions',
        destination: 'http://localhost:8000/v1/chat/completions', // 這裡用 localhost
      },
    ];
  },
};

export default nextConfig;
