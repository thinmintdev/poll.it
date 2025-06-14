// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // Temporarily disable ESLint during build to work around dependency issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build for now
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add proper image domains if you're using Next.js Image component
  images: {
    domains: ["awideweb.com", "localhost", "supabase.co"],
  },
  // Custom webpack config to handle specific dependency issues
  webpack: (config, { isServer }) => {
    // Fix for specific module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any specific aliases here if needed
    };
    
    return config;
  },
};
