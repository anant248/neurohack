import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/practice",
        permanent: false,
      },
      // backward-compat: old route still works
      {
        source: "/facelandmarker",
        destination: "/practice",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
