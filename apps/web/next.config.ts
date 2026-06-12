import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@grubcheck/domain", "@grubcheck/render"]
};

export default nextConfig;

