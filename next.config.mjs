/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['*.spock.replit.dev', '*.replit.dev'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xpwlsnszmzyuyrwnhwha.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
