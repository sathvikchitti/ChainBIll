import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Parent folder also has package-lock.json; pin Turbopack root to this app.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
