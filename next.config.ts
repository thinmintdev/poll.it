import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Socket.IO compatibility
  serverExternalPackages: ['socket.io'],

  // Performance optimizations for visualization libraries
  webpack: (config, { isServer }) => {
    // Optimize Chart.js tree shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      'chart.js': 'chart.js/auto',
    };

    // Optimize bundle splitting for visualization libraries
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          chartjs: {
            name: 'chartjs',
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          maps: {
            name: 'maps',
            test: /[\\/]node_modules[\\/](leaflet|react-leaflet|react-simple-maps)[\\/]/,
            chunks: 'all',
            priority: 15,
          },
          utils: {
            name: 'utils',
            test: /[\\/]node_modules[\\/](date-fns|numbro|classnames|lodash)[\\/]/,
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    return config;
  },

  // SWC minification is enabled by default in Next.js 15

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      'chart.js',
      'react-chartjs-2',
      'date-fns',
      'numbro',
      'classnames',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
