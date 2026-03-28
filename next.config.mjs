/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.picard.replit.dev',
    '*.spock.replit.dev',
    '*.repl.co',
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
