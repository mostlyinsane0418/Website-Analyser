import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper output for Vercel
  output: undefined, // Let Vercel auto-detect

  // Disable strict mode for faster dev
  reactStrictMode: true,
};

export default nextConfig;
