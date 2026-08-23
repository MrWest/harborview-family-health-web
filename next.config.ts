import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production builds stable in constrained Cloud Run and CI environments.
  experimental: { cpus: 1 },
};

export default nextConfig;
