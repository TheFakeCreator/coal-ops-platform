import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["snowflake-sdk"],
  experimental: {
    turbopack: {
      root: __dirname,
    }
  }
};

export default nextConfig;
