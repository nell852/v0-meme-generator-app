/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.picard.replit.dev',
    '56c4fed4-d8e6-4c02-9cdc-0001250b34f7-00-1xcin7e1okatz.picard.replit.dev',
  ],
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
