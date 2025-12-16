/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle better-sqlite3 - it's a native module
      config.externals.push('better-sqlite3')
    }
    return config
  },
}

module.exports = nextConfig
