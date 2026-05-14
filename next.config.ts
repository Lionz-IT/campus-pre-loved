import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'vpeixvydzffkcdvysngq.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lznbwpxvakjhyjbfvfqk.supabase.co',
      },
    ],
  },
}

export default nextConfig
