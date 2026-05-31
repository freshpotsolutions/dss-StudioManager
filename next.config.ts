import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root (multiple lockfiles exist higher up the tree).
  turbopack: { root: path.resolve(".") },
};

export default nextConfig;
