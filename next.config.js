/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables are automatically available in Next.js 14
  // No need to explicitly define them in the config
  
  // Optimize for production deployment
  experimental: {
    // Future experimental features can be added here
  },
  
  // Handle build-time environment variable validation
  env: {
    // These will be available at build time and runtime
    CUSTOM_BUILD_TIME: new Date().toISOString()
  },

  // Vercel-specific optimizations
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  }
}

module.exports = nextConfig