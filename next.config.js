/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable for better docker support if needed
    outputFileTracingRoot: process.env.NODE_ENV === 'production' 
      ? undefined
      : __dirname,
  },
  // Add path aliases for '@' imports
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
  // Add rewrites or redirects here if needed
}

module.exports = nextConfig