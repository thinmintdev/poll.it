import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Socket.IO compatibility
  serverExternalPackages: ['socket.io'],
};

export default nextConfig;
