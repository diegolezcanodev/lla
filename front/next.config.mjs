/** @type {import('next').NextConfig} */
const apiUrl = (process.env.API_URL || 'http://localhost:3500').replace(/\/+$/, '')

const nextConfig = {
  output: 'standalone',

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
