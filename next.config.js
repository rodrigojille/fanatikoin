const { i18n } = require('./next-i18next.config');
const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'],
  },
  // Optimize production builds
  swcMinify: true,
  // Enable compression
  compress: true,
  // Configure build output
  output: 'standalone',
  // Reduce initial JS payload size
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    // Polyfill fallbacks for web3 libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
    };
    
    // Split chunks for better caching
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          web3Vendors: {
            test: /[\\/]node_modules[\\/](@?web3|ethers|@?ethereum|@?biconomy|@?walletconnect)[\\/]/,
            name: 'web3-vendors',
            priority: 20,
            reuseExistingChunk: true,
          },
          uiComponents: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            priority: 10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
};

// Apply bundle analyzer wrapper
module.exports = withBundleAnalyzer(nextConfig);
